(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      toggle.classList.toggle("is-open");
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var panels = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-panel]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!panels.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + panels.length) % panels.length;
      panels.forEach(function (panel, panelIndex) {
        panel.classList.toggle("is-active", panelIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var roots = {};
    document.querySelectorAll("[data-card-search]").forEach(function (input) {
      var selector = input.getAttribute("data-card-search");
      if (!selector) {
        return;
      }
      roots[selector] = true;
      input.addEventListener("input", function () {
        applyFilter(selector);
      });
    });
    document.querySelectorAll("[data-filter-root]").forEach(function (select) {
      var selector = select.getAttribute("data-filter-root");
      if (!selector) {
        return;
      }
      roots[selector] = true;
      select.addEventListener("change", function () {
        applyFilter(selector);
      });
    });
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      document.querySelectorAll("[data-card-search]").forEach(function (input) {
        input.value = query;
        applyFilter(input.getAttribute("data-card-search"));
      });
    }
    Object.keys(roots).forEach(applyFilter);
  }

  function applyFilter(selector) {
    var root = document.querySelector(selector);
    if (!root) {
      return;
    }
    var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
    var searchInput = document.querySelector("[data-card-search='" + selector + "']");
    var query = normalize(searchInput ? searchInput.value : "");
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root='" + selector + "']"));
    var filters = {};
    selects.forEach(function (select) {
      var name = select.getAttribute("data-filter-name");
      if (name && select.value) {
        filters[name] = select.value;
      }
    });
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-filter-text"));
      var visible = !query || text.indexOf(query) !== -1;
      Object.keys(filters).forEach(function (name) {
        if (String(card.getAttribute("data-" + name) || "") !== filters[name]) {
          visible = false;
        }
      });
      card.classList.toggle("is-hidden", !visible);
    });
  }

  window.initMoviePlayer = function (playerId, streamUrl) {
    ready(function () {
      var shell = document.getElementById(playerId);
      if (!shell) {
        return;
      }
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var started = false;
      var hlsInstance = null;
      function begin() {
        if (started) {
          video.play();
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        button.classList.add("is-hidden");
        video.controls = true;
        var play = video.play();
        if (play && typeof play.catch === "function") {
          play.catch(function () {});
        }
      }
      button.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (!started) {
          begin();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  };

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
  });
})();
