document.addEventListener('DOMContentLoaded', function() {
    // Add any JavaScript functionality here
    console.log('Weather Dashboard is ready!');
    
    // Example: Auto-focus search input
    const searchInput = document.querySelector('input[name="location"]');
    if (searchInput) {
        searchInput.focus();
    }
    
    // Example: Confirm before unpinning a location
    const unpinButtons = document.querySelectorAll('button[name="unpin_location"]');
    unpinButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to remove this location?')) {
                e.preventDefault();
            }
        });
    });
    
    // Weather Map Integration
    const mapContainer = document.getElementById('weathermap');
    if (mapContainer) {
        // Initialize map
        const map = L.map('weathermap').setView([20, 0], 2);

        // Add OpenStreetMap base layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Example: List of major cities (you can expand this list)
        const cities = [
            { name: 'London', lat: 51.5074, lon: -0.1278 },
            { name: 'New York', lat: 40.7128, lon: -74.0060 },
            { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
            { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
            { name: 'Cairo', lat: 30.0444, lon: 31.2357 }
        ];

        // Fetch weather for each city and add marker
        cities.forEach(city => {
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=5c2f122653c4978e69c79272fa83eb83&units=metric&lang=en`)
                .then(response => response.json())
                .then(data => {
                    if (data.cod === 200) {
                        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                        const marker = L.marker([city.lat, city.lon]).addTo(map);
                        marker.bindPopup(`
                            <b>${data.name}</b><br>
                            <img src="${iconUrl}" alt="icon"><br>
                            ${Math.round(data.main.temp)}°C<br>
                            ${data.weather[0].description}
                        `);
                    }
                });
        });
    }

    // Get user's current location
    function getUserLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                // If we're on the map page
                if (typeof map !== 'undefined') {
                    map.setView([latitude, longitude], 13);
                    L.marker([latitude, longitude])
                        .addTo(map)
                        .bindPopup('Your Location')
                        .openPopup();
                }

                // Fetch weather for current location
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=5c2f122653c4978e69c79272fa83eb83&units=metric&lang=en`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.cod === 200) {
                            const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                            const weatherInfo = `
                                <div style="text-align:center;">
                                    <div>
                                        <strong>${Math.round(data.main.temp)}°C</strong> | 
                                        <span>💧${data.main.humidity}%</span> | 
                                        <span>💨${data.wind.speed} m/s</span> | 
                                        <span>🔽${data.main.pressure} hPa</span>
                                    </div>
                                    <div>
                                        <img src="${iconUrl}" alt="weather icon" style="width:50px;height:50px;">
                                    </div>
                                    <div>
                                        <b>Your Location</b>
                                    </div>
                                    <div>
                                        <small>${data.weather[0].description}</small>
                                    </div>
                                </div>
                            `;
                            
                            if (typeof map !== 'undefined') {
                                L.popup()
                                    .setLatLng([latitude, longitude])
                                    .setContent(weatherInfo)
                                    .openOn(map);
                            }
                        }
                    });
            }, function(error) {
                console.error("Error getting location:", error);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }

    // Add location button to map controls
    if (document.querySelector('.controls-container')) {
        const locationBtn = document.createElement('button');
        locationBtn.className = 'btn btn-light';
        locationBtn.innerHTML = '<i class="weather-icon">📍</i> My Location';
        locationBtn.onclick = getUserLocation;
        document.querySelector('.btn-group-vertical').appendChild(locationBtn);
    }
});