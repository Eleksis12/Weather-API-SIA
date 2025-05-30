document.addEventListener('DOMContentLoaded', function() {
    const pinnedBtn = document.getElementById('btn-pinned');
    const pinnedSidebar = document.getElementById('pinned-sidebar');
    const closePinnedBtn = document.getElementById('close-pinned');
    const pinnedList = document.getElementById('pinned-list');
    const forecastSidebar = document.getElementById('forecast-sidebar'); // Add this line

    function togglePinned() {
        // Close forecast sidebar if open
        if (forecastSidebar && forecastSidebar.classList.contains('active')) {
            forecastSidebar.classList.remove('active');
        }
        pinnedSidebar.classList.toggle('active');
        if (pinnedSidebar.classList.contains('active')) {
            updatePinnedSidebar();
        }
    }

    if (pinnedBtn) pinnedBtn.addEventListener('click', togglePinned);
    if (closePinnedBtn) closePinnedBtn.addEventListener('click', togglePinned);

    function updatePinnedSidebar() {
        fetch('api/pinned.php')
            .then(response => response.json())
            .then(pinnedLocations => {
                pinnedList.innerHTML = '';
                if (Array.isArray(pinnedLocations) && pinnedLocations.length > 0) {
                    pinnedLocations.forEach(loc => {
                        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&appid=5c2f122653c4978e69c79272fa83eb83&units=metric&lang=en`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.cod === 200) {
                                    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
                                    const card = document.createElement('div');
                                    card.className = 'pinned-card';
                                    card.innerHTML = `
                                        <div class="pinned-city">${loc.name || loc.city}, ${loc.country}</div>
                                        <img src="${iconUrl}" class="pinned-icon" alt="icon">
                                        <div class="pinned-temp">${Math.round(data.main.temp)}°C</div>
                                        <div class="pinned-desc">${data.weather[0].description}</div>
                                    `;
                                    // Add click event to center map and show marker
                                    card.addEventListener('click', function() {
                                        if (window.map) {
                                            // Remove previous pinned marker if exists
                                            if (window.pinnedMarker) {
                                                window.map.removeLayer(window.pinnedMarker);
                                            }
                                            // Add green marker
                                            const greenIcon = L.divIcon({
                                                html: `<i class="bi bi-geo-alt-fill" style="font-size:2rem;color:#22c55e;text-shadow:0 2px 8px #bbf7d0;"></i>`,
                                                iconSize: [32, 32],
                                                iconAnchor: [16, 32],
                                                className: 'pinned-marker-icon'
                                            });
                                            window.pinnedMarker = L.marker([loc.lat, loc.lon], { icon: greenIcon, title: `${loc.name || loc.city}, ${loc.country}` }).addTo(window.map);
                                            window.pinnedMarker.bindPopup(`
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
                                                        <b>${loc.name || loc.city}, ${loc.country}</b>
                                                    </div>
                                                    <div>
                                                        <small>${data.weather[0].description}</small>
                                                    </div>
                                                </div>
                                            `);

                                            // Move the map, then open the popup after move is complete
                                            window.map.setView([loc.lat, loc.lon], 13, { animate: true });

                                            // Wait for the map to finish moving before opening the popup
                                            window.map.once('moveend', function() {
                                                window.pinnedMarker.openPopup();
                                            });
                                        }
                                    });
                                    pinnedList.appendChild(card);
                                }
                            });
                    });
                } else {
                    pinnedList.innerHTML = '<div class="text-muted w-100 text-center">No pinned locations yet.</div>';
                }
            });
    }

    // Expose updatePinnedSidebar globally if needed
    window.updatePinnedSidebar = updatePinnedSidebar;
});