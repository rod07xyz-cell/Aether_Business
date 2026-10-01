<?php
/*
 * Asistente de la web: recibe la conversación del navegador y responde con un modelo de IA en Groq.
 * La clave de API está en config.php (privado), nunca llega al navegador.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function reply(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

// Diagnóstico: abre api/chat.php?diagnostico en el navegador para ver qué falla
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['diagnostico'])) {
    $cfgFile = __DIR__ . '/config.php';
    $cfg = is_file($cfgFile) ? require $cfgFile : null;
    $key = is_array($cfg) ? trim((string) ($cfg['groq_api_key'] ?? '')) : '';
    $model = is_array($cfg) ? (string) ($cfg['model'] ?? '') : '';
    $report = [
        'php' => PHP_VERSION,
        'curl' => function_exists('curl_init'),
        'config_php' => is_array($cfg) ? 'ok' : 'no encontrado o mal formado',
        'clave_puesta' => $key !== '',
        'clave_formato' => $key === '' ? null : (str_starts_with($key, 'gsk_') ? 'ok (gsk_…)' : 'no empieza por gsk_'),
        'modelo' => $model,
    ];
    if ($key !== '' && function_exists('curl_init')) {
        $ch = curl_init(rtrim($cfg['base_url'] ?? 'https://api.groq.com/openai/v1', '/') . '/models');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key],
        ]);
        $raw = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        $json = is_string($raw) ? json_decode($raw, true) : null;
        $report['groq_conexion'] = $raw === false ? 'error: ' . $err : 'HTTP ' . $code;
        if ($code === 200 && isset($json['data'])) {
            $ids = array_column($json['data'], 'id');
            $report['modelo_disponible'] = in_array($model, $ids, true);
            // Modelos de chat (se excluyen los de audio, voz y filtros de seguridad)
            $report['modelos_chat'] = array_values(array_filter(
                $ids,
                fn ($id) => !preg_match('/whisper|tts|playai|orpheus|guard|safeguard/i', $id)
            ));
            sort($report['modelos_chat']);
        } elseif (is_array($json)) {
            $report['groq_error'] = $json['error']['message'] ?? 'desconocido';
        }
    }
    header('X-Robots-Tag: noindex');
    reply(200, $report);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(405, ['error' => 'method_not_allowed']);
}

// Solo peticiones desde la propia web
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$originHost = (string) parse_url($origin, PHP_URL_HOST);
$originPort = parse_url($origin, PHP_URL_PORT);
if ($originPort !== null) {
    $originHost .= ':' . $originPort;
}
if ($origin !== '' && strtolower($originHost) !== strtolower($_SERVER['HTTP_HOST'] ?? '')) {
    reply(403, ['error' => 'forbidden']);
}

$configFile = __DIR__ . '/config.php';
$config = is_file($configFile) ? require $configFile : [];
$apiKey = $config['groq_api_key'] ?? '';
if ($apiKey === '' || !function_exists('curl_init')) {
    reply(503, ['error' => 'not_configured']);
}

// ── Validar la conversación ──
$input = json_decode((string) file_get_contents('php://input'), true);
$history = is_array($input['messages'] ?? null) ? $input['messages'] : [];
$history = array_slice($history, -12);

$messages = [];
foreach ($history as $m) {
    $role = $m['role'] ?? '';
    $text = trim((string) ($m['content'] ?? ''));
    if (!in_array($role, ['user', 'assistant'], true) || $text === '') {
        continue;
    }
    $text = mb_substr($text, 0, 1000);
    // Mantener turnos alternos: se unen mensajes seguidos del mismo rol
    $last = count($messages) - 1;
    if ($last >= 0 && $messages[$last]['role'] === $role) {
        $messages[$last]['content'] .= "\n\n" . $text;
    } else {
        $messages[] = ['role' => $role, 'content' => $text];
    }
}
while ($messages && $messages[0]['role'] !== 'user') {
    array_shift($messages);
}
if (!$messages || end($messages)['role'] !== 'user') {
    reply(400, ['error' => 'bad_request']);
}

// ── Límite de mensajes por IP y hora ──
$limit = (int) ($config['max_messages_per_hour'] ?? 30);
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/aether_chat_' . hash('sha256', $ip);
$now = time();
$hits = is_file($rateFile) ? (json_decode((string) file_get_contents($rateFile), true) ?: []) : [];
$hits = array_values(array_filter($hits, fn ($t) => is_int($t) && $t > $now - 3600));
if (count($hits) >= $limit) {
    reply(429, ['error' => 'rate_limited']);
}
$hits[] = $now;
file_put_contents($rateFile, json_encode($hits), LOCK_EX);

// ── Llamada a Groq (API compatible con OpenAI) ──
$payload = [
    'model' => $model = $config['model'] ?? 'openai/gpt-oss-120b',
    'messages' => array_merge(
        [['role' => 'system', 'content' => require __DIR__ . '/prompt.php']],
        $messages
    ),
    'temperature' => 0.4,
    'max_tokens' => 1500,
];
// Modelos que razonan antes de responder: poco razonamiento y sin mostrarlo,
// para que respondan rápido y no se coman el espacio de la respuesta
if (str_starts_with($model, 'openai/gpt-oss')) {
    $payload['reasoning_effort'] = 'low';
    $payload['include_reasoning'] = false;
} elseif (stripos($model, 'qwen') !== false) {
    $payload['reasoning_format'] = 'hidden';
}

$endpoint = rtrim($config['base_url'] ?? 'https://api.groq.com/openai/v1', '/') . '/chat/completions';
$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
]);
$raw = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($raw === false) {
    error_log('Aether chat connection error: ' . $curlError);
    reply(502, ['error' => 'upstream']);
}
if ($status === 429) {
    reply(503, ['error' => 'busy']);
}
$data = json_decode((string) $raw, true);
if ($status !== 200 || !is_array($data)) {
    error_log('Aether chat API error ' . $status . ': ' . mb_substr((string) $raw, 0, 500));
    reply(502, ['error' => 'upstream', 'status' => $status, 'detail' => mb_substr((string) ($data['error']['message'] ?? ''), 0, 200)]);
}

$text = (string) ($data['choices'][0]['message']['content'] ?? '');
$text = trim((string) preg_replace('/<think>.*?<\/think>/s', '', $text));
if ($text === '') {
    reply(502, ['error' => 'empty']);
}

reply(200, ['reply' => $text]);
