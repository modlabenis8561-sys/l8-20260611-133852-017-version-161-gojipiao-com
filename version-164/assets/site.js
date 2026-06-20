document.addEventListener("DOMContentLoaded", function () {
    var navButton = document.querySelector("[data-nav-toggle]");
    if (navButton) {
        navButton.addEventListener("click", function () {
            document.body.classList.toggle("nav-open");
        });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("image-missing");
        }, { once: true });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        var show = function (next) {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("is-active", index === current);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle("is-active", index === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    var panel = document.querySelector("[data-filter-panel]");
    if (panel) {
        var keyword = panel.querySelector("[data-filter-keyword]");
        var year = panel.querySelector("[data-filter-year]");
        var type = panel.querySelector("[data-filter-type]");
        var category = panel.querySelector("[data-filter-category]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        if (keyword && initial) {
            keyword.value = initial;
        }

        var apply = function () {
            var q = keyword ? keyword.value.trim().toLowerCase() : "";
            var y = year ? year.value : "";
            var t = type ? type.value : "";
            var c = category ? category.value : "";

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.category
                ].join(" ").toLowerCase();
                var matched = true;

                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (y && card.dataset.year !== y) {
                    matched = false;
                }
                if (t && card.dataset.type !== t) {
                    matched = false;
                }
                if (c && card.dataset.category !== c) {
                    matched = false;
                }

                card.classList.toggle("hidden-by-filter", !matched);
            });
        };

        [keyword, year, type, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }
});
