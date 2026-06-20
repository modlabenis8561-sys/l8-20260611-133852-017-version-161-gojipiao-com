(function () {
  var body = document.body;
  var menuButton = document.querySelector('.menu-toggle');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      var opened = body.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  var heroRoot = document.querySelector('[data-hero]');

  if (heroRoot) {
    var slides = Array.prototype.slice.call(heroRoot.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(heroRoot.querySelectorAll('.hero-dot'));
    var active = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === active);
      });

      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === active);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    start();
  }

  var filterLists = Array.prototype.slice.call(document.querySelectorAll('.filter-list'));

  if (filterLists.length) {
    var input = document.querySelector('.filter-input');
    var category = document.querySelector('.category-filter');
    var year = document.querySelector('.year-filter');
    var empty = document.querySelector('.empty-state');

    var runFilter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedCategory = category ? category.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      filterLists.forEach(function (list) {
        Array.prototype.slice.call(list.querySelectorAll('.filter-card')).forEach(function (card) {
          var searchText = card.getAttribute('data-search') || '';
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matchedKeyword = !keyword || searchText.indexOf(keyword) !== -1;
          var matchedCategory = !selectedCategory || cardCategory === selectedCategory;
          var matchedYear = !selectedYear || cardYear === selectedYear;
          var matched = matchedKeyword && matchedCategory && matchedYear;

          card.classList.toggle('is-filtered-out', !matched);

          if (matched) {
            visible += 1;
          }
        });
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
      runFilter();
    }
  }
})();

function initMoviePlayer(src) {
  var video = document.querySelector('.movie-player');
  var overlay = document.querySelector('.player-overlay');
  var hlsInstance = null;
  var attached = false;

  if (!video || !src) {
    return;
  }

  var attach = function () {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = src;
  };

  var play = function () {
    attach();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!attached) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
