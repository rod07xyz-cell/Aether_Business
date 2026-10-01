<?php
/*
 * Asistente de la web: recibe la conversación del navegador y responde con Claude.
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
$apiKey = $config['anthropic_api_key'] ?? '';
if ($apiKey === '' || !is_file(__DIR__ . '/vendor/autoload.php')) {
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

// ── Llamada a Claude ──
require __DIR__ . '/vendor/autoload.php';

use Anthropic\Client;
use Anthropic\Core\Exceptions\APIConnectionException;
use Anthropic\Core\Exceptions\APIStatusException;
use Anthropic\Core\Exceptions\RateLimitException;

try {
    $client = new Client(apiKey: $apiKey, baseUrl: $config['base_url'] ?? null);
    $message = $client->beta->messages->create(
        maxTokens: 2048,
        messages: $messages,
        model: $config['model'] ?? 'claude-opus-5-5',
        system: [
            ['type' => 'text', 'text' => require __DIR__ . '/prompt.php', 'cacheControl' => ['type' => 'ephemeral']],
        ],
        outputConfig: ['effort' => 'low'],
        fallbacks: 'default',
        betas: ['server-side-fallback-2026-07-01'],
    );
} catch (RateLimitException $e) {
    reply(503, ['error' => 'busy']);
} catch (APIStatusException $e) {
    error_log('Aether chat API error: ' . $e->getMessage());
    reply(502, ['error' => 'upstream']);
} catch (APIConnectionException $e) {
    error_log('Aether chat connection error: ' . $e->getMessage());
    reply(502, ['error' => 'upstream']);
} catch (\Throwable $e) {
    error_log('Aether chat error: ' . $e->getMessage());
    reply(500, ['error' => 'server']);
}

if ($message->stopReason === 'refusal') {
    reply(200, ['reply' => 'De eso no puedo ayudarte, pero si tienes dudas sobre Aether o quieres automatizar tu negocio, pregúntame o [reserva una llamada](#contacto).']);
}

$text = '';
foreach ($message->content as $block) {
    if ($block->type === 'text') {
        $text .= $block->text;
    }
}
$text = trim($text);
if ($text === '') {
    reply(502, ['error' => 'empty']);
}

reply(200, ['reply' => $text]);
