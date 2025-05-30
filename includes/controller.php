<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/functions.php';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['search'])) {
        $location = trim($_POST['location']);
        $weatherData = getWeatherData($location);
        $forecastData = getWeatherData($location, 'forecast');
    } elseif (isset($_POST['pin_location'])) {
        $city = $_POST['city'];
        $country = $_POST['country'];
        $lat = $_POST['lat'];
        $lon = $_POST['lon'];
        addPinnedLocation($city, $country, $lat, $lon);
    } elseif (isset($_POST['unpin_location'])) {
        $id = $_POST['location_id'];
        removePinnedLocation($id);
    }
}

// Get current weather for default location (if no search)
if (!isset($weatherData) && !isset($_POST['search'])) {
    $defaultLocation = 'London';
    $weatherData = getWeatherData($defaultLocation);
    $forecastData = getWeatherData($defaultLocation, 'forecast');
}

// Get pinned locations
$pinnedLocations = getPinnedLocations();