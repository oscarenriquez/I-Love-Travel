(function() {
    const searchForm = document.getElementById('destination-search-form');
    const searchInput = document.getElementById('destination-search-input');
    const resetButton = document.getElementById('destination-search-reset');
    const resultsSection = document.getElementById('search-results-section');
    const resultsGrid = document.querySelector('[data-js="search-results-grid"]');
    const resultsSummary = document.querySelector('[data-js="search-results-summary"]');

    let recommendationData = null;

    const keywordAliases = {
        beach: 'beaches',
        beaches: 'beaches',
        temple: 'temples',
        temples: 'temples',
        country: 'countries',
        countries: 'countries'
    };

    function normalizeKeyword(value) {
        return value.trim().toLowerCase();
    }

    function createResultCard(item) {
        const card = document.createElement('article');
        card.className = 'result-card';

        const image = document.createElement('img');
        image.className = 'result-card__image';
        image.src = `./images/${item.imageUrl}`;
        image.alt = item.name;

        const title = document.createElement('h3');
        title.className = 'result-card__title';
        title.textContent = item.name;

        const description = document.createElement('p');
        description.className = 'result-card__description';
        description.textContent = item.description;

        card.append(image, title, description);

        return card;
    }

    function renderEmptyState(query) {
        resultsGrid.innerHTML = '';
        const emptyState = document.createElement('p');
        emptyState.className = 'results-empty';
        emptyState.textContent = `No recommendations found for "${query}". Try beaches, temples, countries, or a country name like Japan.`;
        resultsGrid.appendChild(emptyState);
        resultsSummary.textContent = 'No matching recommendations were found.';
        resultsSection.hidden = false;
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderResults(query, items) {
        resultsGrid.innerHTML = '';
        items.forEach((item) => {
            resultsGrid.appendChild(createResultCard(item));
        });

        resultsSummary.textContent = `${items.length} result${items.length === 1 ? '' : 's'} found for "${query}".`;
        resultsSection.hidden = false;
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function getCountryResults(countryName) {
        const matchedCountry = recommendationData.countries.find((country) => country.name.toLowerCase() === countryName);
        return matchedCountry ? matchedCountry.cities : [];
    }

    function resolveSearchResults(query) {
        const normalizedQuery = normalizeKeyword(query);
        const matchedCategory = keywordAliases[normalizedQuery];

        if (matchedCategory) {
            if (matchedCategory === 'countries') {
                return recommendationData.countries.flatMap((country) => country.cities);
            }

            return recommendationData[matchedCategory];
        }

        return getCountryResults(normalizedQuery);
    }

    function handleSearch(event) {
        event.preventDefault();

        if (!recommendationData) {
            return;
        }

        const query = searchInput.value.trim();
        if (!query) {
            resultsSection.hidden = true;
            resultsGrid.innerHTML = '';
            resultsSummary.textContent = '';
            return;
        }

        const matchedResults = resolveSearchResults(query);

        if (matchedResults.length === 0) {
            renderEmptyState(query);
            return;
        }

        renderResults(query, matchedResults);
    }

    function handleReset() {
        resultsSection.hidden = true;
        resultsGrid.innerHTML = '';
        resultsSummary.textContent = '';
    }

    fetch('./travel_recommendation_api.json')
        .then((response) => response.json())
        .then((data) => {
            recommendationData = data;
        })
        .catch((error) => {
            resultsSection.hidden = false;
            resultsGrid.innerHTML = '';
            resultsSummary.textContent = 'Recommendations could not be loaded at the moment.';
            console.error(error);
        });

    searchForm.addEventListener('submit', handleSearch);
    resetButton.addEventListener('click', handleReset);
})();
