document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchLocation');
    const searchForm = document.getElementById('searchForm');
    let suggestionsContainer;
    let activeIndex = -1;
    let currentSuggestions = [];

    // Create suggestions container
    function createSuggestionsContainer() {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggestions-container';
        searchInput.parentNode.appendChild(suggestionsContainer);
    }
    createSuggestionsContainer();

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Fetch suggestions
    const fetchSuggestions = debounce(async (query) => {
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        suggestionsContainer.innerHTML = '<div class="suggestion-item disabled">Loading...</div>';
        suggestionsContainer.style.display = 'block';

        try {
            const response = await fetch(`api/suggestions.php?query=${encodeURIComponent(query)}`);
            const suggestions = await response.json();
            currentSuggestions = suggestions;
            if (suggestions.length > 0) {
                displaySuggestions(suggestions);
            } else {
                suggestionsContainer.innerHTML = '<div class="suggestion-item disabled">No results found</div>';
                suggestionsContainer.style.display = 'block';
            }
        } catch (error) {
            suggestionsContainer.innerHTML = '<div class="suggestion-item disabled">Error fetching suggestions</div>';
            suggestionsContainer.style.display = 'block';
            console.error('Error fetching suggestions:', error);
        }
    }, 300);

    // Display suggestions
    function displaySuggestions(suggestions) {
        suggestionsContainer.innerHTML = '';
        activeIndex = -1;

        suggestions.forEach((suggestion, idx) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <div class="location-name fw-bold">${suggestion.name}</div>
                <div class="location-detail text-muted small">${suggestion.state ? suggestion.state + ', ' : ''}${suggestion.country}</div>
            `;

            div.addEventListener('mousedown', (e) => {
                e.preventDefault();
                selectSuggestion(idx);
            });

            suggestionsContainer.appendChild(div);
        });

        suggestionsContainer.style.display = 'block';
    }

    // Select suggestion
    function selectSuggestion(idx) {
        const suggestion = currentSuggestions[idx];
        if (!suggestion) return;
        searchInput.value = `${suggestion.name}, ${suggestion.country}`;
        suggestionsContainer.style.display = 'none';

        if (typeof map !== 'undefined') {
            map.setView([suggestion.lat, suggestion.lon], 13);
            if (typeof updateWeatherInfo === 'function') {
                updateWeatherInfo(suggestion.lat, suggestion.lon);
            }
        } else {
            searchForm.submit();
        }
    }

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        const items = suggestionsContainer.querySelectorAll('.suggestion-item:not(.disabled)');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
            updateActiveSuggestion(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            updateActiveSuggestion(items);
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && activeIndex < items.length) {
                e.preventDefault();
                selectSuggestion(activeIndex);
            }
        }
    });

    function updateActiveSuggestion(items) {
        items.forEach((item, idx) => {
            if (idx === activeIndex) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Input event listener
    searchInput.addEventListener('input', (e) => {
        fetchSuggestions(e.target.value);
    });

    // Close suggestions when clicking outside
    document.addEventListener('mousedown', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Hide suggestions on blur (with timeout to allow click)
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsContainer.style.display = 'none';
        }, 150);
    });
});