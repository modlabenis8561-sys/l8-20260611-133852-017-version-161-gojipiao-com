(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const miniCards = Array.from(hero.querySelectorAll('[data-hero-mini]'));
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const startTimer = () => {
      timer = window.setInterval(() => showSlide(current + 1), 5200);
    };

    const resetTimer = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        resetTimer();
      });
    });

    miniCards.forEach((card, index) => {
      card.addEventListener('mouseenter', () => showSlide(index));
      card.addEventListener('focus', () => showSlide(index));
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  const applyLocalFilter = (form) => {
    const input = form.querySelector('input');
    const list = document.querySelector('[data-filter-list]');

    if (!input || !list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));

    input.addEventListener('input', () => {
      const query = normalize(input.value);
      cards.forEach((card) => {
        const text = normalize(card.innerText + ' ' + card.dataset.title + ' ' + card.dataset.year + ' ' + card.dataset.region + ' ' + card.dataset.type + ' ' + card.dataset.genre);
        card.classList.toggle('is-filtered-out', query && !text.includes(query));
      });
    });
  };

  document.querySelectorAll('[data-local-filter]').forEach(applyLocalFilter);

  const searchForm = document.querySelector('[data-search-page]');
  const searchList = document.querySelector('[data-search-list]');

  if (searchForm && searchList) {
    const params = new URLSearchParams(window.location.search);
    const input = searchForm.querySelector('input[name="q"]');
    const year = searchForm.querySelector('select[name="year"]');
    const cards = Array.from(searchList.querySelectorAll('.movie-card'));

    if (input) {
      input.value = params.get('q') || '';
    }

    if (year) {
      year.value = params.get('year') || '';
    }

    const filterCards = () => {
      const query = normalize(input ? input.value : '');
      const yearValue = year ? year.value : '';

      cards.forEach((card) => {
        const text = normalize(card.innerText + ' ' + card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.type + ' ' + card.dataset.genre + ' ' + card.dataset.year);
        const matchesQuery = !query || text.includes(query);
        const matchesYear = !yearValue || card.dataset.year === yearValue;
        card.classList.toggle('is-filtered-out', !(matchesQuery && matchesYear));
      });
    };

    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const nextParams = new URLSearchParams();
      if (input && input.value.trim()) {
        nextParams.set('q', input.value.trim());
      }
      if (year && year.value) {
        nextParams.set('year', year.value);
      }
      const nextUrl = nextParams.toString() ? `${window.location.pathname}?${nextParams}` : window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
      filterCards();
    });

    if (input) {
      input.addEventListener('input', filterCards);
    }

    if (year) {
      year.addEventListener('change', filterCards);
    }

    filterCards();
  }

  const playerPanel = document.querySelector('[data-player]');

  if (playerPanel) {
    const video = playerPanel.querySelector('video');
    const startButton = playerPanel.querySelector('[data-player-start]');
    const stream = playerPanel.getAttribute('data-stream');
    let hlsInstance = null;
    let loadingLibrary = false;

    const loadScript = (callback) => {
      if (window.Hls) {
        callback();
        return;
      }

      if (loadingLibrary) {
        window.setTimeout(() => loadScript(callback), 120);
        return;
      }

      loadingLibrary = true;
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
      script.onload = callback;
      script.onerror = callback;
      document.head.appendChild(script);
    };

    const playVideo = () => {
      if (!video || !stream) {
        return;
      }

      if (startButton) {
        startButton.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = stream;
        }
        video.play().catch(() => {});
        return;
      }

      loadScript(() => {
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => {});
            });
          } else {
            video.play().catch(() => {});
          }
        } else {
          if (!video.src) {
            video.src = stream;
          }
          video.play().catch(() => {});
        }
      });
    };

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) {
          playVideo();
        }
      });
    }
  }
})();
