(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('open');
            document.body.classList.toggle('menu-open', open);
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-header-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var query = input ? input.value.trim() : '';
            if (query) {
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
            dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var genreFilter = document.querySelector('[data-genre-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var empty = document.querySelector('[data-empty-message]');

    function normalized(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var keyword = normalized(searchInput && searchInput.value);
        var typeValue = normalized(typeFilter && typeFilter.value);
        var yearValue = normalized(yearFilter && yearFilter.value);
        var regionValue = normalized(regionFilter && regionFilter.value);
        var genreValue = normalized(genreFilter && genreFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalized(card.textContent);
            var typeText = normalized(card.getAttribute('data-type'));
            var yearText = normalized(card.getAttribute('data-year'));
            var regionText = normalized(card.getAttribute('data-region'));
            var genreText = normalized(card.getAttribute('data-genre'));
            var match = true;

            if (keyword && text.indexOf(keyword) === -1) {
                match = false;
            }
            if (typeValue && typeText.indexOf(typeValue) === -1) {
                match = false;
            }
            if (yearValue && yearText !== yearValue) {
                match = false;
            }
            if (regionValue && regionText.indexOf(regionValue) === -1) {
                match = false;
            }
            if (genreValue && genreText.indexOf(genreValue) === -1) {
                match = false;
            }

            card.classList.toggle('hidden-card', !match);
            if (match) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    [searchInput, typeFilter, yearFilter, regionFilter, genreFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            searchInput.value = query;
        }
        filterCards();
    }
})();
