<?php
/*
 * PLANTILLA — copia este archivo como config.php y rellénalo.
 * config.php no se sube a GitHub: súbelo a mano al hosting.
 */
return [
    // Clave de API de Groq: https://console.groq.com/keys
    'groq_api_key' => '',

    // Modelo Llama de Groq (lista actual en https://console.groq.com/docs/models)
    'model' => 'llama-3.3-70b-versatile',

    // Límite de mensajes por visitante (IP) y hora, para controlar el gasto
    'max_messages_per_hour' => 30,
];
