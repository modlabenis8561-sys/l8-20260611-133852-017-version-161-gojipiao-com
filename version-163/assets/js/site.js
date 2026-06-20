(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var opened = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  if (slides.length > 1) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
      });
    });
    setInterval(function () {
      setSlide(activeSlide + 1);
    }, 5600);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var genreSelect = filterPanel.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var countNode = document.querySelector('[data-filter-count]');
    var emptyNode = document.querySelector('.empty-state');

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var genre = genreSelect ? genreSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-region') || ''
        ].join(' ').toLowerCase();
        var yearValue = card.getAttribute('data-year') || '';
        var genreValue = card.getAttribute('data-genre') || '';
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && yearValue !== year) {
          matched = false;
        }
        if (genre && genreValue.indexOf(genre) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' 部作品';
      }
      if (emptyNode) {
        emptyNode.classList.toggle('is-visible', visible === 0);
      }
    }

    [keywordInput, yearSelect, genreSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilters);
        node.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var searchRoot = document.querySelector('[data-search-root]');

  if (searchRoot && Array.isArray(window.SEARCH_MOVIES)) {
    var params = new URLSearchParams(window.location.search);
    var searchInput = searchRoot.querySelector('[data-search-input]');
    var categorySelect = searchRoot.querySelector('[data-search-category]');
    var yearSelectSearch = searchRoot.querySelector('[data-search-year]');
    var resultGrid = searchRoot.querySelector('[data-search-results]');
    var resultText = searchRoot.querySelector('[data-search-count]');

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    function createSearchCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '<a class="cover-wrap" href="' + movie.href + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'; this.parentElement.classList.add(\'image-missing\');">',
        '<span class="cover-title">' + escapeHtml(movie.title) + '</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<div class="movie-meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '<h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-list">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function runSearch() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelectSearch ? yearSelectSearch.value : '';

      var results = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (category && movie.categorySlug !== category) {
          matched = false;
        }
        if (year && movie.year !== year) {
          matched = false;
        }

        return matched;
      }).slice(0, 240);

      if (resultGrid) {
        resultGrid.innerHTML = results.map(createSearchCard).join('');
      }
      if (resultText) {
        resultText.textContent = keyword || category || year ? '找到 ' + results.length + ' 部相关作品' : '展示最新与热门作品 ' + results.length + ' 部';
      }
    }

    [searchInput, categorySelect, yearSelectSearch].forEach(function (node) {
      if (node) {
        node.addEventListener('input', runSearch);
        node.addEventListener('change', runSearch);
      }
    });

    runSearch();
  }
})();

function initializeMoviePlayer(sourceUrl) {
  var video = document.querySelector('.movie-player');
  var overlay = document.querySelector('.player-overlay');

  if (!video || !sourceUrl) {
    return;
  }

  function bindSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function startPlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  bindSource();

  if (overlay) {
    overlay.addEventListener('click', startPlay);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
}
