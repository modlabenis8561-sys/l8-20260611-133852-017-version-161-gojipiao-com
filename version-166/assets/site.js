(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.hidden = expanded;
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute("data-search") || "",
      card.getAttribute("data-title") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-year") || ""
    ].join(" ").toLowerCase();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector(".page-filter-input");
    var buttons = Array.prototype.slice.call(panel.querySelectorAll(".filter-btn"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var active = "all";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var content = textOf(card);
        var matchedText = !query || content.indexOf(query) !== -1;
        var matchedFilter = active === "all" || content.indexOf(active.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(matchedText && matchedFilter));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        active = button.getAttribute("data-filter-value") || "all";
        apply();
      });
    });
  }

  function movieCard(record) {
    var tags = [record.type, record.year, record.region, record.genre].filter(Boolean).join(" · ");
    return [
      '<article class="movie-card">',
      '  <a href="' + record.url + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + record.cover + '" alt="' + escapeHtml(record.title) + '" loading="lazy">',
      '      <span class="play-chip">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <div class="card-kicker">' + escapeHtml(record.type || "影视") + ' · ' + escapeHtml(record.year || "") + '</div>',
      '      <h3>' + escapeHtml(record.title) + '</h3>',
      '      <p>' + escapeHtml(record.oneLine || "") + '</p>',
      '      <div class="card-meta"><span>' + escapeHtml(tags) + '</span></div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var box = document.getElementById("search-results");
    var heading = document.getElementById("search-heading");
    if (!box || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim().toLowerCase();
    var visibleRecords = [];

    if (keyword) {
      visibleRecords = window.SEARCH_MOVIES.filter(function (record) {
        var content = [
          record.title,
          record.oneLine,
          record.region,
          record.type,
          record.year,
          record.genre,
          record.category,
          (record.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return content.indexOf(keyword) !== -1;
      });
      if (heading) {
        heading.textContent = "搜索结果：" + params.get("q");
      }
    } else if (heading) {
      heading.textContent = "输入关键词开始搜索";
    }

    if (!keyword) {
      box.innerHTML = "";
      return;
    }

    if (!visibleRecords.length) {
      box.innerHTML = '<p class="empty-result">没有找到相关内容</p>';
      return;
    }

    box.innerHTML = visibleRecords.map(movieCard).join("");
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();

function initializeMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-video");
  var overlay = document.getElementById("play-overlay");
  var status = document.getElementById("player-status");
  var hlsInstance = null;
  var attached = false;

  if (!video) {
    return;
  }

  function writeStatus(message) {
    if (status) {
      status.textContent = message || "";
    }
  }

  function attachStream() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          writeStatus("播放加载中，请稍候");
          hlsInstance.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          writeStatus("播放恢复中，请稍候");
          hlsInstance.recoverMediaError();
        } else {
          writeStatus("播放遇到问题，请稍后再试");
        }
      });
      return;
    }

    video.src = streamUrl;
  }

  function play() {
    attachStream();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    writeStatus("");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", play);
  }

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
