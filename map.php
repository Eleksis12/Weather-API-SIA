<?php require_once 'navbar.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Weather Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/map.css">
    <link rel="stylesheet" href="assets/css/pinned.css">
</head>
<body class="d-flex flex-column" style="min-height:100vh;">

  <!-- Map Container -->
  <div id="map"></div>

  <!-- Weather Layer Controls -->
  <div class="controls-container">
    <div class="btn-group-vertical" role="group" aria-label="Weather Layers">
      <button type="button" class="btn btn-light active" id="btn-temp">
        <i class="weather-icon">🌡️</i> Temperature
      </button>
      <button type="button" class="btn btn-light" id="btn-pressure">
        <i class="weather-icon">📊</i> Pressure
      </button>
      <button type="button" class="btn btn-light" id="btn-wind">
        <i class="weather-icon">💨</i> Wind
      </button>
      <button type="button" class="btn btn-light" id="btn-clouds">
        <i class="weather-icon">☁️</i> Clouds
      </button>
    </div>
    
  </div>

  <!-- Location Control (bottom right) -->
  <div class="location-container d-flex gap-2">
    <button type="button" class="btn" id="btn-location" title="My Location">
        <i class="bi bi-geo-alt-fill weather-icon"></i>
    </button>
    <button type="button" class="btn btn-primary d-flex align-items-center" id="btn-forecast">
        <i class="bi bi-bar-chart-line me-2"></i>
        <span class="toggle-text">See Weather Forecast</span>
    </button>
    <button type="button" class="btn btn-success d-flex align-items-center" id="btn-pinned">
        <i class="bi bi-pin-angle-fill me-2"></i>
        <span class="toggle-text">See Pinned Locations</span>
    </button>
  </div>

  <!-- Forecast Toggle Button 
  <div class="forecast-toggle">
    <button type="button" class="btn btn-primary" id="btn-forecast">
        <i class="bi bi-chevron-right" id="forecast-arrow"></i>
    </button>
  </div> -->

  <!-- Forecast Sidebar -->
  <div class="forecast-sidebar" id="forecast-sidebar">
    <div class="forecast-header position-relative">
        <h5 class="mb-0 fw-bold text-primary">Weather Forecast</h5>
        <button type="button" class="btn-close-forecast" id="close-forecast" aria-label="Close">
            <i class="bi bi-x-lg"></i>
        </button>
    </div>
    <div class="forecast-content">
        <div class="today-forecast mb-4">
            <h6 class="border-bottom pb-2 text-secondary">Today</h6>
            <div id="today-weather" class="d-flex align-items-center justify-content-center" style="min-height:80px;">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
        <div class="five-day-forecast">
            <h6 class="border-bottom pb-2 text-secondary">5-Day Forecast</h6>
            <div id="forecast-weather" class="d-flex flex-wrap gap-2 justify-content-between"></div>
        </div>
    </div>
  </div>

  <!-- Pinned Locations Sidebar -->
  <div class="pinned-sidebar" id="pinned-sidebar">
    <div class="forecast-header position-relative" style="background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);">
        <h5 class="mb-0 fw-bold text-success">Pinned Locations</h5>
        <button type="button" class="btn-close-forecast" id="close-pinned" aria-label="Close">
            <i class="bi bi-x-lg"></i>
        </button>
    </div>
    <div class="forecast-content">
        <div id="pinned-list" class="d-flex flex-wrap gap-2 justify-content-between"></div>
    </div>
</div>

  <!-- Temperature Legend -->
  <div id="temp-legend" class="legend">
    <div class="legend-title">Temperature</div>
    <div class="legend-scale">
        <div class="legend-gradient" style="background: linear-gradient(to right, #00008B, #0000FF, #00FFFF, #FFFF00, #FF0000, #800000);"></div>
        <div>-40°C to 40°C</div>
    </div>
  </div>

  <!-- Pressure Legend -->
  <div id="pressure-legend" class="legend">
    <div class="legend-title">Pressure</div>
    <div class="legend-scale">
        <div class="legend-gradient" style="background: linear-gradient(to right, #984ea3, #ff7f00, #ffff33, #a65628);"></div>
        <div>950 hPa to 1050 hPa</div>
    </div>
  </div>

  <!-- Wind Legend -->
  <div id="wind-legend" class="legend">
    <div class="legend-title">Wind Speed</div>
    <div class="legend-scale">
        <div class="legend-gradient" style="background: linear-gradient(to right, #ffffff, #98c2fa, #6699ff, #0033cc);"></div>
        <div>0 m/s to 30 m/s</div>
    </div>
  </div>

  <!-- Clouds Legend -->
  <div id="clouds-legend" class="legend">
    <div class="legend-title">Cloud Coverage</div>
    <div class="legend-scale">
        <div class="legend-gradient" style="background: linear-gradient(to right, #ffffff, #c4c4c4, #6b6b6b, #1a1a1a);"></div>
        <div>0% to 100%</div>
    </div>
  </div>

  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <!-- Custom JS -->
  <script src="assets/js/map.js"></script>
  <script src="assets/js/pinned.js"></script>
  <script>
    // Add this function or update your existing search handler

function handleSearchLocation(lat, lon, name, country, map) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=5c2f122653c4978e69c79272fa83eb83&units=metric&lang=en`)
        .then(response => response.json())
        .then(weather => {
            if (weather.cod === 200) {
                const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
                const popupContent = `
                    <div style="text-align:center;">
                        <div>
                            <strong>${Math.round(weather.main.temp)}°C</strong> | 
                            <span>💧${weather.main.humidity}%</span> | 
                            <span>💨${weather.wind.speed} m/s</span> | 
                            <span>🔽${weather.main.pressure} hPa</span>
                        </div>
                        <div>
                            <img src="${iconUrl}" alt="Weather icon" style="width:50px;height:50px;">
                        </div>
                        <div>
                            <b>${name}, ${country}</b>
                        </div>
                        <div>
                            <small>${weather.weather[0].description}</small>
                        </div>
                    </div>
                `;

                // Use a custom marker icon (location icon, blue color)
                const searchIcon = L.divIcon({
                    html: `<i class="bi bi-geo-alt-fill" style="font-size:2rem;color:#2563eb;text-shadow:0 2px 8px #bae6fd;"></i>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    className: 'search-marker-icon'
                });

                // Remove previous search marker if it exists
                if (window.searchMarker) {
                    map.removeLayer(window.searchMarker);
                }

                window.searchMarker = L.marker([lat, lon], { icon: searchIcon, title: `${name}, ${country}` }).addTo(map);
                window.searchMarker.bindPopup(popupContent).openPopup();
            }
        });
}
  </script>
</body>
</html>
