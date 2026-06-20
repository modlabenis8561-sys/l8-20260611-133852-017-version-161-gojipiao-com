function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function setupMenu() {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener('click', function () {
    var open = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function setupHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (!slides.length) {
    return;
  }
  var index = 0;
  var timer = null;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }
  function play() {
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(timer);
      show(Number(dot.getAttribute('data-slide') || 0));
      play();
    });
  });
  play();
}

function setupSearchForms() {
  Array.prototype.slice.call(document.querySelectorAll('.site-search')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        return;
      }
      event.preventDefault();
      window.location.href = 'search.html?q=' + encodeURIComponent(value);
    });
  });
}

function setupLibraryFilter() {
  var form = document.querySelector('.library-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  if (!form || !cards.length) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var keywordInput = form.querySelector('[data-filter="keyword"]');
  if (keywordInput && initialQuery) {
    keywordInput.value = initialQuery;
  }
  function read(name) {
    var element = form.querySelector('[data-filter="' + name + '"]');
    return element ? element.value.trim().toLowerCase() : '';
  }
  function apply() {
    var keyword = read('keyword');
    var type = read('type');
    var year = read('year');
    var region = read('region');
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var matched = true;
      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }
      if (type && (card.getAttribute('data-type') || '').toLowerCase().indexOf(type) === -1) {
        matched = false;
      }
      if (year && (card.getAttribute('data-year') || '').toLowerCase().indexOf(year) === -1) {
        matched = false;
      }
      if (region && (card.getAttribute('data-region') || '').toLowerCase().indexOf(region) === -1) {
        matched = false;
      }
      card.classList.toggle('is-filtered-out', !matched);
      var row = card.closest('.rank-row');
      if (row) {
        row.classList.toggle('is-filtered-out', !matched);
      }
    });
  }
  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  apply();
}

function initializeMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var button = document.getElementById('player-start');
  var overlay = document.querySelector('.player-overlay');
  if (!video || !streamUrl) {
    return;
  }
  var attached = false;
  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  }
  function play() {
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }
  if (button) {
    button.addEventListener('click', play);
  }
  if (overlay) {
    overlay.addEventListener('click', play);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
}

ready(function () {
  setupMenu();
  setupHero();
  setupSearchForms();
  setupLibraryFilter();
});
