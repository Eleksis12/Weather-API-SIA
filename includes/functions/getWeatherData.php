<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

// Function to fetch weather data from OpenWeather API
function getWeatherData($location, $type = 'weather') {
    $apiKey = OPENWEATHER_API_KEY;
    $url = OPENWEATHER_API_URL . $type . '?q=' . urlencode($location) . '&appid=' . $apiKey . '&units=metric';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}