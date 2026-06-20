import { H as Hls } from './hls-vendor-dru42stk.js';

export function setupPlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.playButtonId);
    var source = options.source;
    var hls = null;
    var loaded = false;

    if (!video || !overlay || !button || !source) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function startPlayback() {
        loadSource();
        overlay.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
    });

    overlay.addEventListener('click', function () {
        startPlayback();
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
