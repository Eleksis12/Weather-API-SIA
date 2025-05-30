<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<!-- Navigation Bar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <!-- Logo and Brand -->
        <a class="navbar-brand d-flex align-items-center" href="index.php">
            <i class="bi bi-cloud-sun-fill me-2 weather-logo"></i>
            WeatherApp
        </a>

        <!-- Navbar Toggler -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navbar Content -->
        <div class="collapse navbar-collapse" id="navbarNav">
            <!-- Navigation Links -->
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link<?= basename($_SERVER['PHP_SELF']) == 'index.php' ? ' active' : '' ?>" href="index.php">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link<?= basename($_SERVER['PHP_SELF']) == 'map.php' ? ' active' : '' ?>" href="map.php">Map</a>
                </li>
            </ul>

            <?php if (basename($_SERVER['PHP_SELF']) == 'map.php'): ?>
            <!-- Search Bar (only on map.php) -->
            <form class="d-flex search-wrapper mx-3" method="post" action="#" id="searchForm" style="flex:1; max-width:400px;">
                <div class="search-box w-100">
                    <input class="form-control search-input" type="search" placeholder="Search location..." aria-label="Search" id="searchLocation" name="location" autocomplete="off" style="border-radius: 30px 0 0 30px;">
                    <button class="btn btn-outline-light search-icon" type="submit" style="border-radius: 0 30px 30px 0;">
                        <i class="bi bi-search"></i>
                    </button>
                </div>
            </form>
            <?php endif; ?>

            <!-- Current Location Display -->
            <div id="current-location" class="d-flex align-items-center ms-3">
                <i class="bi bi-geo-alt-fill me-1"></i>
                <span id="location-text" style="font-size: 0.97rem;">Detecting...</span>
            </div>

            
        </div>
    </div>
</nav>

<!-- Add Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- Add Bootstrap Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">
<!-- Add custom styles -->
<link rel="stylesheet" href="assets/css/navbar.css">
<link href="https://fonts.googleapis.com/css?family=Quicksand:400,600&display=swap" rel="stylesheet">

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Show user's current location in navbar
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=5c2f122653c4978e69c79272fa83eb83`)
                .then(response => response.json())
                .then(data => {
                    if (data && data[0]) {
                        const locationText = `${data[0].name}, ${data[0].country}`;
                        document.getElementById('location-text').textContent = locationText;
                    } else {
                        document.getElementById('location-text').textContent = 'Location unavailable';
                    }
                })
                .catch(() => {
                    document.getElementById('location-text').textContent = 'Location unavailable';
                });
        }, function() {
            document.getElementById('location-text').textContent = 'Location unavailable';
        });
    } else {
        document.getElementById('location-text').textContent = 'Location not supported';
    }

    // Handle search form submission for map.php
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchLocation');
    const isMapPage = window.location.pathname.includes('map.php');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            if (isMapPage) {
                e.preventDefault();
                const searchQuery = searchInput.value;
                fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=1&appid=5c2f122653c4978e69c79272fa83eb83`)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const { lat, lon, name, country } = data[0];
                            if (typeof map !== 'undefined') {
                                map.setView([lat, lon], 13);

                                // Remove previous search marker if it exists
                                if (window.searchMarker) {
                                    map.removeLayer(window.searchMarker);
                                }

                                // Fetch weather for the searched location
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

                                            window.searchMarker = L.marker([lat, lon], { icon: searchIcon, title: `${name}, ${country}` }).addTo(map);
                                            window.searchMarker.bindPopup(popupContent).openPopup();
                                        }
                                    });
                            }
                        } else {
                            alert('Location not found. Please try again.');
                        }
                    })
                    .catch(() => {
                        alert('Error searching location. Please try again.');
                    });
            }
        });
    }
});
</script>

<script src="assets/js/search.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>