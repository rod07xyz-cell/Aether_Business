<?php
/*
 * PLANTILLA — copia este archivo como config.php y rellénalo.
 * config.php no se sube a GitHub: súbelo a mano al hosting.
 */
return [
    // Clave de API de Groq: https://console.groq.com/keys
    'groq_api_key' => '',

    // Modelo de Groq (para ver los disponibles: abre api/chat.php?diagnostico)
    'model' => 'openai/gpt-oss-120b',

    // Límite de mensajes por visitante (IP) y hora, para controlar el gasto
    'max_messages_per_hour' => 30,
];
