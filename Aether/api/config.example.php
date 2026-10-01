<?php
/*
 * PLANTILLA — copia este archivo como config.php y rellénalo.
 * config.php no se sube a GitHub: súbelo a mano al hosting.
 */
return [
    // Clave de API de Anthropic: https://console.anthropic.com → API Keys
    'anthropic_api_key' => '',

    // Modelo de Claude que responde en la web
    'model' => 'claude-opus-5-5',

    // Límite de mensajes por visitante (IP) y hora, para controlar el gasto
    'max_messages_per_hour' => 30,
];
