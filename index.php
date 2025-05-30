<?php
require_once 'includes/controller.php';
require_once 'navbar.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Dashboard</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Leaflet CSS and JS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-omnivore@0.3.4/leaflet-omnivore.min.js"></script>
</head>
<body<?php if (isset($weatherData['weather'][0]['main'])): ?> style="background: url('assets/img/<?= strtolower($weatherData['weather'][0]['main']) ?>.jpg') no-repeat center center fixed; background-size: cover;"<?php endif; ?>>
    <div class="container">
        <header class="text-center my-4">
            <h1>Weather Dashboard</h1>
            <p>Get real-time weather updates for any location</p>
        </header>

        <?php if (isset($weatherData['alerts']) && is_array($weatherData['alerts']) && count($weatherData['alerts']) > 0): ?>
            <div class="alert alert-warning mb-4">
                <h4 class="alert-heading"><i class="bi bi-exclamation-triangle-fill"></i> Weather Alerts</h4>
                <?php foreach ($weatherData['alerts'] as $alert): ?>
                    <div class="mb-2">
                        <strong><?= htmlspecialchars($alert['event']) ?>:</strong>
                        <?= nl2br(htmlspecialchars($alert['description'])) ?>
                        <?php if (!empty($alert['sender_name'])): ?>
                            <br><small class="text-muted">Source: <?= htmlspecialchars($alert['sender_name']) ?></small>
                        <?php endif; ?>
                        <?php if (!empty($alert['start']) && !empty($alert['end'])): ?>
                            <br><small class="text-muted">
                                From: <?= date('M d, Y H:i', $alert['start']) ?> 
                                To: <?= date('M d, Y H:i', $alert['end']) ?>
                            </small>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <div class="row">
            <!-- Search Section -->
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h3>Search Location</h3>
                    </div>
                    <div class="card-body">
                        <form method="post">
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" name="location" placeholder="Enter city name" required>
                                <button class="btn btn-primary" type="submit" name="search">Search</button>
                            </div>
                        </form>

                        <form method="post" style="display:inline;">
    <input type="hidden" name="location" value="<?= $weatherData['name'] ?>">
    <button type="submit" name="search" class="btn btn-outline-secondary btn-sm" title="Refresh">
        <i class="bi bi-arrow-clockwise"></i> Refresh
    </button>
</form>

                        <?php if (isset($weatherData) && $weatherData['cod'] == 200): ?>
                            <div class="current-weather mt-4">
                                <h4>Current Weather in <?= $weatherData['name'] ?>, <?= $weatherData['sys']['country'] ?></h4>
                                <div class="d-flex align-items-center">
                                    <img src="https://openweathermap.org/img/wn/<?= $weatherData['weather'][0]['icon'] ?>@2x.png" alt="Weather icon">
                                    <div class="ms-3">
                                        <h2><?= round($weatherData['main']['temp']) ?>°C</h2>
                                        <p><?= ucfirst($weatherData['weather'][0]['description']) ?></p>
                                    </div>
                                </div>
                                <div class="weather-details mt-3">
                                    <p><strong>Feels Like:</strong> <?= round($weatherData['main']['feels_like']) ?>°C</p>
                                    <p><strong>Humidity:</strong> <?= $weatherData['main']['humidity'] ?>%</p>
                                    <p><strong>Wind:</strong> <?= $weatherData['wind']['speed'] ?> m/s</p>
                                    <p><strong>Pressure:</strong> <?= $weatherData['main']['pressure'] ?> hPa</p>
                                    <?php
    // Calculate local sunrise/sunset using timezone offset
    $timezoneOffset = isset($weatherData['timezone']) ? $weatherData['timezone'] : 0;
    $sunriseLocal = $weatherData['sys']['sunrise'] + $timezoneOffset;
    $sunsetLocal = $weatherData['sys']['sunset'] + $timezoneOffset;
?>
<p><strong>Sunrise:</strong> <?= date('g:i A', $sunriseLocal) ?></p>
<p><strong>Sunset:</strong> <?= date('g:i A', $sunsetLocal) ?></p>
                                </div>
                                
                                <!-- Pin location form -->
                                <form method="post" class="mt-3">
                                    <input type="hidden" name="city" value="<?= $weatherData['name'] ?>">
                                    <input type="hidden" name="country" value="<?= $weatherData['sys']['country'] ?>">
                                    <input type="hidden" name="lat" value="<?= $weatherData['coord']['lat'] ?>">
                                    <input type="hidden" name="lon" value="<?= $weatherData['coord']['lon'] ?>">
                                    <button type="submit" name="pin_location" class="btn btn-sm btn-outline-primary">
                                        <i class="bi bi-pin"></i> Pin Location
                                    </button>
                                </form>
                            </div>
                        <?php elseif (isset($weatherData) && $weatherData['cod'] != 200): ?>
                            <div class="alert alert-danger mt-4">
                                <?= $weatherData['message'] ?>
                            </div>
                        <?php endif; ?>

                        <?php if (isset($weatherData['alerts'])): ?>
                            <div class="alert alert-warning mt-3">
                                <h5>Weather Alert</h5>
                                <?php foreach ($weatherData['alerts'] as $alert): ?>
                                    <strong><?= htmlspecialchars($alert['event']) ?>:</strong>
                                    <?= htmlspecialchars($alert['description']) ?><br>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- Pinned Locations -->
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-header bg-success text-white">
                        <h3>Pinned Locations</h3>
                    </div>
                    <div class="card-body">
                        <?php if (!empty($pinnedLocations)): ?>
                            <div class="row">
                                <?php foreach ($pinnedLocations as $location): ?>
                                    <?php 
                                        $weather = getWeatherByCoords($location['lat'], $location['lon']);
                                        if ($weather['cod'] == 200):
                                    ?>
                                    <div class="col-md-6 mb-3">
                                        <div class="card">
                                            <div class="card-body">
                                                <h5><?= $location['city'] ?>, <?= $location['country'] ?></h5>
                                                <div class="d-flex align-items-center">
                                                    <img src="https://openweathermap.org/img/wn/<?= $weather['weather'][0]['icon'] ?>@2x.png" alt="Weather icon" width="60">
                                                    <div class="ms-2">
                                                        <h6><?= round($weather['main']['temp']) ?>°C</h6>
                                                        <small><?= ucfirst($weather['weather'][0]['description']) ?></small>
                                                    </div>
                                                </div>
                                                <form method="post" class="mt-2">
                                                    <input type="hidden" name="location_id" value="<?= $location['id'] ?>">
                                                    <button type="submit" name="unpin_location" class="btn btn-sm btn-outline-danger">
                                                        <i class="bi bi-trash"></i> Remove
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <?php endif; ?>
                                <?php endforeach; ?>
                            </div>
                        <?php else: ?>
                            <p>No pinned locations yet. Search for a location and pin it to save.</p>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- 5-Day Forecast -->
        <?php if (isset($forecastData) && $forecastData['cod'] == '200'): ?>
        <div class="card mb-4">
            <div class="card-header bg-info text-white">
                <h3>5-Day Forecast</h3>
            </div>
            <div class="card-body">
                <div class="row">
                    <?php 
                    // Group forecast by day
                    $forecastByDay = [];
                    foreach ($forecastData['list'] as $forecast) {
                        $date = date('Y-m-d', $forecast['dt']);
                        if (!isset($forecastByDay[$date]) || count($forecastByDay[$date]) < 8) {
                            $forecastByDay[$date][] = $forecast;
                        }
                    }
                    
                    // Display forecast for the next 5 days
                    $counter = 0;
                    foreach ($forecastByDay as $date => $forecasts):
                        if ($counter >= 5) break;
                        $dayName = date('D', strtotime($date));
                        $avgTemp = array_sum(array_map(function($f) { return $f['main']['temp']; }, $forecasts)) / count($forecasts);
                        $mainWeather = $forecasts[0]['weather'][0];
                    ?>
                    <div class="col">
                        <div class="text-center">
                            <h5><?= $dayName ?></h5>
                            <img src="https://openweathermap.org/img/wn/<?= $mainWeather['icon'] ?>.png" alt="Weather icon">
                            <p><?= round($avgTemp) ?>°C</p>
                            <small><?= ucfirst($mainWeather['description']) ?></small>
                        </div>
                    </div>
                    <?php 
                        $counter++;
                    endforeach; 
                    ?>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <div class="mt-4 text-center small text-muted">
    <strong>Legend:</strong>
    <img src="https://openweathermap.org/img/wn/01d.png" alt="Clear" width="24"> Clear
    <img src="https://openweathermap.org/img/wn/02d.png" alt="Clouds" width="24"> Clouds
    <img src="https://openweathermap.org/img/wn/09d.png" alt="Rain" width="24"> Rain
    <img src="https://openweathermap.org/img/wn/13d.png" alt="Snow" width="24"> Snow
    <img src="https://openweathermap.org/img/wn/50d.png" alt="Mist" width="24"> Mist
</div>


    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/script.js"></script>
</body>
</html>