document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(function (box) {
        var video = box.querySelector("video");
        var button = box.querySelector("button");
        var message = box.querySelector(".player-message");
        if (!video) {
            return;
        }

        var stream = video.getAttribute("data-hls") || "";
        var fail = function () {
            if (message) {
                message.textContent = "视频加载失败，请稍后重试";
                message.classList.add("is-visible");
            }
        };

        if (stream) {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        fail();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else {
                video.src = stream;
            }
        }

        var toggle = function () {
            if (video.paused) {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(fail);
                }
            } else {
                video.pause();
            }
        };

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                toggle();
            });
        }

        video.addEventListener("click", function () {
            toggle();
        });

        video.addEventListener("play", function () {
            box.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
            box.classList.remove("is-playing");
        });
    });
});
