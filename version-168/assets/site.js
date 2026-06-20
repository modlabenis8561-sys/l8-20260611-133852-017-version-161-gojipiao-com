function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

ready(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;
        function setHero(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === index);
            });
        }
        function startHero() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                setHero(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener('click', function () {
                setHero(itemIndex);
                startHero();
            });
        });
        if (slides.length > 1) {
            startHero();
        }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));
    panels.forEach(function (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var list = document.querySelector('[data-card-list]');
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .horizontal-card'));
        function fillSelect(select, field, descending) {
            if (!select) {
                return;
            }
            var values = [];
            cards.forEach(function (card) {
                var value = card.getAttribute(field) || '';
                if (value && values.indexOf(value) === -1) {
                    values.push(value);
                }
            });
            values.sort(function (a, b) {
                if (descending) {
                    return b.localeCompare(a, 'zh-CN', { numeric: true });
                }
                return a.localeCompare(b, 'zh-CN', { numeric: true });
            });
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }
        fillSelect(regionSelect, 'data-region', false);
        fillSelect(typeSelect, 'data-type', false);
        fillSelect(yearSelect, 'data-year', true);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (input && q) {
            input.value = q;
        }
        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var ok = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    ok = false;
                }
                if (type && card.getAttribute('data-type') !== type) {
                    ok = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
            });
        }
        [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    });
});

function initMoviePlayer(streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    if (!video || !overlay || !streamUrl) {
        return;
    }
    var hls = null;
    var bound = false;
    function bindSource() {
        if (bound) {
            return;
        }
        bound = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = streamUrl;
    }
    function start() {
        overlay.classList.add('is-hidden');
        bindSource();
        video.play().catch(function () {});
    }
    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (!bound) {
            start();
        }
    });
    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
