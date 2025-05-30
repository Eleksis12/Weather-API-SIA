const apiKey = '5c2f122653c4978e69c79272fa83eb83';

    // Initialize the map
    const map = L.map('map').setView([20, 0], 2);

    // Base tile layer (English labels)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd'
    }).addTo(map);

    // Weather overlay layers
    const layers = {
      Temperature: L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.7 }),
      Pressure: L.tileLayer(`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.7 }),
      Wind: L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.7 }),
      Clouds: L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.7 })
    };

    // Add default layer
    layers.Temperature.addTo(map);

    // Automatically get user location when page loads
    document.addEventListener('DOMContentLoaded', function() {
        getUserLocation();
    });

    // Modified getUserLocation function with error handling and loading state
    function getUserLocation() {
        if ("geolocation" in navigator) {
            const locationBtn = document.getElementById('btn-location');
            if (locationBtn) {
                locationBtn.classList.add('loading');
                locationBtn.innerHTML = '<i class="bi bi-arrow-clockwise weather-icon"></i>';
            }

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    
                    // First, get the location name using reverse geocoding
                    fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`)
                        .then(response => response.json())
                        .then(geoData => {
                            const locationName = geoData[0]?.name;
                            const country = geoData[0]?.country;
                            
                            // Then fetch weather data
                            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=en`)
                                .then(response => response.json())
                                .then(data => {
                                    if (data.cod === 200) {
                                        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                                        const popupContent = `
                                            <div style="text-align:center;">
                                                <div>
                                                    <strong>${Math.round(data.main.temp)}°C</strong> | 
                                                    <span>💧${data.main.humidity}%</span> | 
                                                    <span>💨${data.wind.speed} m/s</span> | 
                                                    <span>🔽${data.main.pressure} hPa</span>
                                                </div>
                                                <div>
                                                    <img src="${iconUrl}" alt="icon" style="width:50px;height:50px;">
                                                </div>
                                                <div>
                                                    <b>${locationName}, ${country}</b>
                                                </div>
                                                <div>
                                                    <small>${data.weather[0].description}</small>
                                                </div>
                                            </div>
                                        `;
                                        
                                        // Center and zoom map to user location
                                        map.setView([latitude, longitude], 13);
                                        
                                        // Update the marker creation with custom red icon
                                        const userLocationIcon = L.divIcon({
                                            html: `<i class="bi bi-geo-alt-fill" style="font-size:2rem;color:#dc2626;text-shadow:0 2px 8px rgba(220,38,38,0.3);"></i>`,
                                            iconSize: [32, 32],
                                            iconAnchor: [16, 32],
                                            className: 'user-location-marker'
                                        });

                                        // Remove previous user location marker if it exists
                                        if (window.userLocationMarker) {
                                            map.removeLayer(window.userLocationMarker);
                                        }

                                        window.userLocationMarker = L.marker([latitude, longitude], {
                                            icon: userLocationIcon,
                                            title: 'Your Location'
                                        }).addTo(map);
                                        
                                        // Bind and open popup
                                        userLocationMarker.bindPopup(popupContent).openPopup();

                                        // Reset location button
                                        if (locationBtn) {
                                            locationBtn.classList.remove('loading');
                                            locationBtn.innerHTML = '<i class="bi bi-geo-alt-fill weather-icon"></i>';
                                        }
                                    }
                                });
                        });
                },
                function(error) {
                    console.error("Error getting location:", error);
                    alert("Unable to get your location. " + error.message);
                    
                    // Reset location button on error
                    if (locationBtn) {
                        locationBtn.classList.remove('loading');
                        locationBtn.innerHTML = '<i class="bi bi-geo-alt-fill weather-icon"></i>';
                    }
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }

    function hideAllLegends() {
        document.querySelectorAll('.legend').forEach(legend => {
            legend.style.display = 'none';
        });
    }

    // Button controls for weather layers
    document.getElementById('btn-temp').onclick = function() {
      map.removeLayer(layers.Pressure);
      map.removeLayer(layers.Wind);
      map.removeLayer(layers.Clouds);
      map.addLayer(layers.Temperature);
      setActive(this);
      hideAllLegends();
      document.getElementById('temp-legend').style.display = 'block';
    };
    document.getElementById('btn-pressure').onclick = function() {
      map.removeLayer(layers.Temperature);
      map.removeLayer(layers.Wind);
      map.removeLayer(layers.Clouds);
      map.addLayer(layers.Pressure);
      setActive(this);
      hideAllLegends();
      document.getElementById('pressure-legend').style.display = 'block';
    };
    document.getElementById('btn-wind').onclick = function() {
      map.removeLayer(layers.Temperature);
      map.removeLayer(layers.Pressure);
      map.removeLayer(layers.Clouds);
      map.addLayer(layers.Wind);
      setActive(this);
      hideAllLegends();
      document.getElementById('wind-legend').style.display = 'block';
    };
    document.getElementById('btn-clouds').onclick = function() {
      map.removeLayer(layers.Temperature);
      map.removeLayer(layers.Pressure);
      map.removeLayer(layers.Wind);
      map.addLayer(layers.Clouds);
      setActive(this);
      hideAllLegends();
      document.getElementById('clouds-legend').style.display = 'block';
    };

    function setActive(btn) {
      document.querySelectorAll('.btn-group-vertical .btn').forEach(b => {
        b.classList.remove('active');
        b.classList.replace('btn-primary', 'btn-light');
      });
      btn.classList.add('active');
      btn.classList.replace('btn-light', 'btn-primary');
    }

    // Example: List of major cities (expand as needed)
    const cities = [
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
      { name: 'Cairo', lat: 30.0444, lon: 31.2357 }
    ];

    // Fetch weather for each city and add marker
    cities.forEach(city => {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric&lang=en`)
        .then(response => response.json())
        .then(data => {
          if (data.cod === 200) {
            const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            const popupContent = `
              <div style="text-align:center;">
                <div>
                  <strong>${Math.round(data.main.temp)}°C</strong> | 
                  <span>💧${data.main.humidity}%</span> | 
                  <span>💨${data.wind.speed} m/s</span> | 
                  <span>🔽${data.main.pressure} hPa</span>
                </div>
                <div>
                  <img src="${iconUrl}" alt="icon" style="width:50px;height:50px;">
                </div>
                <div>
                  <b><a href="#" class="city-name-link" style="color:#2563eb;text-decoration:underline;">${data.name}</a></b>
                </div>
                <div>
                  <small>${data.weather[0].description}</small>
                </div>
              </div>
            `;
            const marker = L.marker([city.lat, city.lon]).addTo(map);
            marker.bindPopup(popupContent);

            // Optional: Add a click event to the city name in the popup
            marker.on('popupopen', function(e) {
                const popupNode = e.popup.getElement();
                const cityNameElem = popupNode.querySelector('.city-name-link');
                if (cityNameElem) {
                    cityNameElem.addEventListener('click', function() {
                        map.setView([city.lat, city.lon], 13);
                        marker.openPopup();
                    });
                }
            });
          }
        });
    });

    // Update the getUserLocation function to use the new button
    function getUserLocation() {
        if ("geolocation" in navigator) {
            const locationBtn = document.getElementById('btn-location');
            if (locationBtn) {
                locationBtn.classList.add('loading');
                locationBtn.innerHTML = '<i class="bi bi-arrow-clockwise weather-icon"></i>';
            }

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    
                    // First, get the location name using reverse geocoding
                    fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`)
                        .then(response => response.json())
                        .then(geoData => {
                            const locationName = geoData[0]?.name;
                            const country = geoData[0]?.country;
                            
                            // Then fetch weather data
                            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=en`)
                                .then(response => response.json())
                                .then(data => {
                                    if (data.cod === 200) {
                                        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                                        const popupContent = `
                                            <div style="text-align:center;">
                                                <div>
                                                    <strong>${Math.round(data.main.temp)}°C</strong> | 
                                                    <span>💧${data.main.humidity}%</span> | 
                                                    <span>💨${data.wind.speed} m/s</span> | 
                                                    <span>🔽${data.main.pressure} hPa</span>
                                                </div>
                                                <div>
                                                    <img src="${iconUrl}" alt="icon" style="width:50px;height:50px;">
                                                </div>
                                                <div>
                                                    <b>${locationName}, ${country}</b>
                                                </div>
                                                <div>
                                                    <small>${data.weather[0].description}</small>
                                                </div>
                                            </div>
                                        `;
                                        
                                        // Center and zoom map to user location
                                        map.setView([latitude, longitude], 13);
                                        
                                        // Update the marker creation with custom red icon
                                        const userLocationIcon = L.divIcon({
                                            html: `<i class="bi bi-geo-alt-fill" style="font-size:2rem;color:#dc2626;text-shadow:0 2px 8px rgba(220,38,38,0.3);"></i>`,
                                            iconSize: [32, 32],
                                            iconAnchor: [16, 32],
                                            className: 'user-location-marker'
                                        });

                                        // Remove previous user location marker if it exists
                                        if (window.userLocationMarker) {
                                            map.removeLayer(window.userLocationMarker);
                                        }

                                        window.userLocationMarker = L.marker([latitude, longitude], {
                                            icon: userLocationIcon,
                                            title: 'Your Location'
                                        }).addTo(map);
                                        
                                        // Bind and open popup
                                        userLocationMarker.bindPopup(popupContent).openPopup();

                                        // Reset location button
                                        if (locationBtn) {
                                            locationBtn.classList.remove('loading');
                                            locationBtn.innerHTML = '<i class="bi bi-geo-alt-fill weather-icon"></i>';
                                        }
                                    }
                                });
                        });
                },
                function(error) {
                    console.error("Error getting location:", error);
                    alert("Unable to get your location. " + error.message);
                    
                    // Reset location button on error
                    if (locationBtn) {
                        locationBtn.classList.remove('loading');
                        locationBtn.innerHTML = '<i class="bi bi-geo-alt-fill weather-icon"></i>';
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }

    // Add click handler to location button
    document.getElementById('btn-location').onclick = getUserLocation;

    // Replace or update the forecast toggle functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Forecast toggle functionality
        const forecastBtn = document.getElementById('btn-forecast');
        const forecastArrow = document.getElementById('forecast-arrow');
        const forecastSidebar = document.getElementById('forecast-sidebar');
        const closeForecastBtn = document.getElementById('close-forecast');

        function toggleForecast() {
            forecastSidebar.classList.toggle('active');
            if (forecastSidebar.classList.contains('active')) {
                updateForecast();
            }
        }

        if (forecastBtn) {
            forecastBtn.addEventListener('click', toggleForecast);
        }
        if (closeForecastBtn) {
            closeForecastBtn.addEventListener('click', toggleForecast);
        }

        function updateForecast(lat, lon) {
            const latitude = lat || map.getCenter().lat;
            const longitude = lon || map.getCenter().lng;

            // Show loading state
            document.getElementById('today-weather').innerHTML = `
                <div class="d-flex justify-content-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;

            // Fetch current weather
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=en`)
                .then(response => response.json())
                .then(data => {
                    if (data.cod === 200) {
                        const todayHTML = `
                            <div class="current-weather">
                                <h4>Current Weather in ${data.name}, ${data.sys.country}</h4>
                                <div class="d-flex align-items-center">
                                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
                                    <div class="ms-3">
                                        <h2>${Math.round(data.main.temp)}°C</h2>
                                        <p>${ucfirst(data.weather[0].description)}</p>
                                    </div>
                                </div>
                                <div class="weather-details mt-3">
                                    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                                    <p><strong>Wind:</strong> ${data.wind.speed} m/s</p>
                                    <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
                                </div>
                            </div>
                        `;
                        document.getElementById('today-weather').innerHTML = todayHTML;
                    }
                });

            // Show loading state for forecast
            document.getElementById('forecast-weather').innerHTML = `
                <div class="d-flex justify-content-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;

            // Fetch 5-day forecast
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=en`)
                .then(response => response.json())
                .then(data => {
                    if (data.cod === "200") {
                        const forecastByDay = {};
                        data.list.forEach(forecast => {
                            const date = new Date(forecast.dt * 1000).toLocaleDateString();
                            if (!forecastByDay[date]) {
                                forecastByDay[date] = forecast;
                            }
                        });

                        let forecastHTML = '';
                        let counter = 0;
                        
                        Object.entries(forecastByDay).forEach(([date, forecast]) => {
                            if (counter > 0 && counter <= 5) { // Skip today, show next 5 days
                                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                                forecastHTML += `
                                    <div class="forecast-day">
                                        <div class="text-center">
                                            <h5>${dayName}</h5>
                                            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather icon">
                                            <p class="mb-1">${Math.round(forecast.main.temp)}°C</p>
                                            <small class="text-muted">${forecast.weather[0].description}</small>
                                            <div class="mt-2">
                                                <span title="Humidity">💧${forecast.main.humidity}%</span> |
                                                <span title="Wind Speed">💨${forecast.wind.speed}m/s</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }
                            counter++;
                        });
                        
                        document.getElementById('forecast-weather').innerHTML = forecastHTML;
                    }
                });
        }

        // Make updateForecast available globally
        window.updateForecast = updateForecast;
    });

    // Helper function to capitalize first letter
    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Search functionality
    document.getElementById('search-form').onsubmit = function(e) {
        e.preventDefault();
        const searchQuery = document.getElementById('search-input').value.trim();
        if (searchQuery) {
            // Geocoding API call
            fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=1&appid=5c2f122653c4978e69c79272fa83eb83`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const { lat, lon, name, country } = data[0];
                        if (typeof map !== 'undefined') {
                            map.setView([lat, lon], 13);
                            handleSearchLocation(lat, lon, name, country, map);
                        }
                    } else {
                        alert('Location not found. Please try again.');
                    }
                });
        }
    };

    function handleSearchLocation(lat, lon, name, country, map) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=en`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                    const popupContent = `
                        <div style="text-align:center;">
                            <div>
                                <strong>${Math.round(data.main.temp)}°C</strong> | 
                                <span>💧${data.main.humidity}%</span> | 
                                <span>💨${data.wind.speed} m/s</span> | 
                                <span>🔽${data.main.pressure} hPa</span>
                            </div>
                            <div>
                                <img src="${iconUrl}" alt="icon" style="width:50px;height:50px;">
                            </div>
                            <div>
                                <b>${name}, ${country}</b>
                            </div>
                            <div>
                                <small>${data.weather[0].description}</small>
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

                    // Update forecast sidebar if open
                    const forecastSidebar = document.getElementById('forecast-sidebar');
                    if (forecastSidebar && forecastSidebar.classList.contains('active')) {
                        updateForecast(lat, lon);
                    }
                }
            });
    }

