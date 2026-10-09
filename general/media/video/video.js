(() => {
  const icon = (name) => `<span class="custom-video-icon custom-video-icon--${name}" aria-hidden="true"></span>`;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  }

  function reportPlaybackError(error) {
    if (error?.name !== "AbortError") {
      console.error("Video playback failed:", error);
    }
  }

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;

    document
      .querySelectorAll(".custom-video-player.is-controls-visible")
      .forEach((player) => {
        if (!player.contains(event.target)) {
          player.classList.remove("is-controls-visible");
        }
      });
  });

  function prepareThumbnail(video) {
    video.muted = true;
    video.pause();
    video.controls = false;

    video.addEventListener("loadedmetadata", () => {
      try {
        video.currentTime = 0;
      } catch {
        // Thumbnail metadata may not be seekable yet.
      }
    }, { once: true });

    video.addEventListener("loadeddata", () => {
      video.muted = true;
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        // Thumbnail metadata may not be seekable yet.
      }
    });
  }

  function initialize(video, config = {}) {
    if (!(video instanceof HTMLVideoElement)) {
      throw new TypeError("VideoPlayer.initialize requires a video element.");
    }

    if (video.dataset.videoPlayerInitialized === "true") {
      return video.closest(".custom-video-player");
    }

    const settings = {
      controls: config.controls ?? video.dataset.videoControls !== "false",
      volumeButton: config.volumeButton ?? video.dataset.videoVolumeButton !== "false",
      volume: config.volume ?? video.dataset.videoVolume,
      fit: config.fit ?? video.dataset.videoFit,
      blurredBackground: config.blurredBackground ?? video.dataset.videoBlurredBackground === "true",
      interactive: config.interactive ?? video.dataset.videoInteractive !== "false",
      autoplay: config.autoplay ?? video.autoplay,
      loop: config.loop ?? video.loop
    };
    const configuredVolume = Number(settings.volume);
    if (settings.volume !== undefined && Number.isFinite(configuredVolume)) {
      video.volume = Math.max(0, Math.min(1, configuredVolume));
    }

    video.dataset.videoPlayerInitialized = "true";
    video.controls = false;
    video.autoplay = settings.autoplay;
    video.loop = settings.loop;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.removeAttribute("controls");

    const player = document.createElement("div");
    player.className = "custom-video-player";
    player.tabIndex = settings.interactive ? 0 : -1;
    ["solo-content", "side-navigation-media"].forEach((className) => {
      if (video.classList.contains(className)) player.classList.add(className);
    });
    if (settings.fit === "contain") player.classList.add("is-contain");
    if (settings.blurredBackground) player.classList.add("has-blurred-background");

    video.classList.add("custom-video-media");
    const parent = video.parentNode;
    if (parent) {
      parent.insertBefore(player, video);
    }
    player.append(video);

    if (settings.blurredBackground) {
      const backdrop = video.cloneNode(true);
      backdrop.removeAttribute("id");
      backdrop.removeAttribute("controls");
      backdrop.removeAttribute("autoplay");
      backdrop.removeAttribute("loop");
      backdrop.className = "custom-video-backdrop";
      backdrop.muted = true;
      backdrop.volume = 0;
      backdrop.autoplay = true;
      backdrop.loop = true;
      backdrop.playsInline = true;
      backdrop.setAttribute("aria-hidden", "true");
      backdrop.setAttribute("muted", "");
      backdrop.setAttribute("autoplay", "");
      backdrop.setAttribute("loop", "");
      player.prepend(backdrop);

      video.addEventListener("timeupdate", () => {
        if (backdrop.readyState >= 1 && Math.abs(backdrop.currentTime - video.currentTime) > 0.25) {
          backdrop.currentTime = video.currentTime;
        }
      });
      video.addEventListener("play", () => backdrop.play().catch(reportPlaybackError));
      video.addEventListener("pause", () => backdrop.pause());
      video.addEventListener("seeked", () => {
        if (backdrop.readyState >= 1) backdrop.currentTime = video.currentTime;
      });
      video.addEventListener("ended", () => {
        if (video.loop) backdrop.currentTime = 0;
      });
    }

    let playButton;
    let volumeButton;
    let volumeSlider;
    let progress;
    let progressTrack;
    let progressHover;
    let progressPlayed;
    let progressTrackContainer;
    let volumeTrackContainer;
    let volumeHover;
    let volumePlayed;
    let timeLabel;
    let fullscreenButton;

    function updateVolumeHover(event) {
      if (!volumeSlider) return;
      const bounds = volumeSlider.getBoundingClientRect();
      if (!bounds.width) return;
      const position = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      volumeTrackContainer.style.setProperty("--volume-hover", `${position * 100}%`);
      volumeTrackContainer.classList.add("is-previewing");
    }

    function togglePlayback() {
      if (video.paused || video.ended) {
        video.play().catch(reportPlaybackError);
      } else {
        video.pause();
      }
    }

    function isFullscreen() {
      return document.fullscreenElement === player ||
        player.contains(document.fullscreenElement) ||
        video.webkitDisplayingFullscreen === true;
    }

    function updatePlayButton() {
      if (!playButton) return;
      const playing = !video.paused && !video.ended;
      playButton.setAttribute("aria-label", playing ? "Pause video" : "Play video");
      playButton.innerHTML = icon(playing ? "paused" : "play");
    }

    function updateVolumeButton() {
      if (!volumeButton) return;
      const muted = video.muted;
      volumeButton.setAttribute("aria-label", muted ? "Unmute video" : "Mute video");
      volumeButton.setAttribute("aria-pressed", String(!muted));
      const volumeIcon = muted || video.volume === 0
        ? "muted"
        : `sound${Math.ceil(video.volume * 4) * 25}`;
      volumeButton.innerHTML = icon(volumeIcon);
      if (volumeSlider) {
        volumeSlider.value = String(video.volume);
      }
      if (volumePlayed) {
        volumePlayed.style.width = `${video.volume * 100}%`;
      }
    }

    function updateProgress() {
      if (!progress || !timeLabel) return;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const currentTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
      const percentage = duration ? (currentTime / duration) * 100 : 0;
      progress.value = String(Math.round(percentage * 10));
      progress.style.setProperty("--progress", `${percentage}%`);
      if (progressPlayed) progressPlayed.style.width = `${percentage}%`;
      if (volumeSlider) {
        if (volumePlayed) volumePlayed.style.width = `${video.volume * 100}%`;
      }
      progress.setAttribute("aria-valuetext", `${formatTime(currentTime)} of ${formatTime(duration)}`);
      timeLabel.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }

    function updateFullscreenButton() {
      if (!fullscreenButton) return;
      const fullscreen = isFullscreen();
      fullscreenButton.setAttribute("aria-label", fullscreen ? "Exit fullscreen" : "Enter fullscreen");
      fullscreenButton.innerHTML = icon(fullscreen ? "windowed" : "fullscreen");
    }

    let controlsHideTimeout;
    let controlsPointerId = null;

    function scheduleControlsHide() {
      clearTimeout(controlsHideTimeout);
      controlsHideTimeout = setTimeout(() => {
        player.classList.remove("is-controls-visible");
      }, 3000);
    }

    function finishTouchControls(event) {
      if (event.pointerId !== controlsPointerId) return;

      controlsPointerId = null;
      scheduleControlsHide();
      window.removeEventListener("pointerup", finishTouchControls);
      window.removeEventListener("pointercancel", finishTouchControls);
    }

    player.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;

      controlsPointerId = event.pointerId;
      player.classList.add("is-controls-visible");
      clearTimeout(controlsHideTimeout);
      window.addEventListener("pointerup", finishTouchControls);
      window.addEventListener("pointercancel", finishTouchControls);
    });

    if (settings.controls) {
      const controls = document.createElement("div");
      controls.className = "custom-video-controls";

      progressTrackContainer = document.createElement("div");
      progressTrackContainer.className = "custom-video-progress-container";

      progressTrack = document.createElement("span");
      progressTrack.className = "custom-video-progress-track";
      progressHover = document.createElement("span");
      progressHover.className = "custom-video-progress-hover";
      progressPlayed = document.createElement("span");
      progressPlayed.className = "custom-video-progress-played";
      progressTrack.append(progressHover, progressPlayed);

      progress = document.createElement("input");
      progress.className = "custom-video-progress";
      progress.type = "range";
      progress.min = "0";
      progress.max = "1000";
      progress.step = "1";
      progress.value = "0";
      progress.setAttribute("aria-label", "Seek video");
      progress.addEventListener("pointermove", (event) => {
        const bounds = progress.getBoundingClientRect();
        const position = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        progressTrackContainer.style.setProperty("--hover-progress", `${position * 100}%`);
        progressTrackContainer.classList.add("is-previewing");
      });
      progress.addEventListener("pointerleave", () => {
        progressTrackContainer.classList.remove("is-previewing");
      });
      progress.addEventListener("input", () => {
        if (Number.isFinite(video.duration)) {
          video.currentTime = video.duration * Number(progress.value) / 1000;
        }
        updateProgress();
      });
      progressTrackContainer.append(progressTrack, progress);

      const row = document.createElement("div");
      row.className = "custom-video-control-row";

      playButton = document.createElement("button");
      playButton.className = "custom-video-control custom-video-play";
      playButton.type = "button";
      playButton.addEventListener("click", togglePlayback);

      timeLabel = document.createElement("span");
      timeLabel.className = "custom-video-time";
      row.append(playButton, timeLabel);

      if (settings.volumeButton) {
        const volumeControl = document.createElement("div");
        volumeControl.className = "custom-video-volume-control";

        volumeTrackContainer = document.createElement("span");
        volumeTrackContainer.className = "custom-video-volume-slider-container";
        const volumeTrack = document.createElement("span");
        volumeTrack.className = "custom-video-volume-track";
        volumeHover = document.createElement("span");
        volumeHover.className = "custom-video-volume-hover";
        volumePlayed = document.createElement("span");
        volumePlayed.className = "custom-video-volume-played";
        volumeTrack.append(volumeHover, volumePlayed);

        volumeSlider = document.createElement("input");
        volumeSlider.className = "custom-video-volume-slider";
        volumeSlider.type = "range";
        volumeSlider.min = "0";
        volumeSlider.max = "1";
        volumeSlider.step = "0.01";
        volumeSlider.value = String(video.volume);
        volumeSlider.setAttribute("aria-label", "Video volume");
        volumeSlider.addEventListener("pointermove", updateVolumeHover);
        volumeSlider.addEventListener("pointerleave", () => {
          volumeTrackContainer.classList.remove("is-previewing");
        });
        volumeSlider.addEventListener("input", () => {
          video.volume = Number(volumeSlider.value);
          video.muted = false;
          updateVolumeButton();
        });

        volumeButton = document.createElement("button");
        volumeButton.className = "custom-video-control custom-video-volume";
        volumeButton.type = "button";
        volumeButton.addEventListener("click", () => {
          volumeControl.classList.toggle("is-volume-open");
          video.muted = !video.muted;
          updateVolumeButton();
        });

        volumeControl.addEventListener("wheel", (event) => {
          event.preventDefault();
          event.stopPropagation();

          const delta = event.deltaY || event.deltaX;
          if (delta === 0) return;

          const deltaScale =
            event.deltaMode === 1
              ? 16
              : event.deltaMode === 2
                ? volumeControl.clientHeight
                : 1;
          video.volume = Math.max(
            0,
            Math.min(1, video.volume - (delta * deltaScale) / 600)
          );
        }, { passive: false });

        volumeControl.append(volumeSlider, volumeButton);
        volumeTrackContainer.append(volumeTrack, volumeSlider);
        volumeControl.prepend(volumeTrackContainer);
        row.append(volumeControl);
        row.classList.add("has-volume-control");
      }

      fullscreenButton = document.createElement("button");
      fullscreenButton.className = "custom-video-control custom-video-fullscreen";
      fullscreenButton.type = "button";
      fullscreenButton.addEventListener("click", async () => {
        try {
          if (isFullscreen()) {
            if (document.fullscreenElement) {
              await document.exitFullscreen();
            } else if (typeof video.webkitExitFullscreen === "function") {
              video.webkitExitFullscreen();
            }
          } else if (player.requestFullscreen) {
            await player.requestFullscreen();
          } else if (typeof video.webkitEnterFullscreen === "function") {
            video.webkitEnterFullscreen();
          }
        } catch (error) {
          reportPlaybackError(error);
        }
        updateFullscreenButton();
      });

      row.append(fullscreenButton);
      controls.append(progressTrackContainer, row);
      controls.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      player.append(controls);

      video.addEventListener("timeupdate", updateProgress);
      video.addEventListener("durationchange", updateProgress);
      video.addEventListener("loadedmetadata", updateProgress);
      video.addEventListener("play", updatePlayButton);
      video.addEventListener("pause", updatePlayButton);
      video.addEventListener("ended", updatePlayButton);
      video.addEventListener("volumechange", () => {
        updateVolumeButton();
        updateProgress();
      });
      player.addEventListener("fullscreenchange", updateFullscreenButton);
      video.addEventListener("webkitbeginfullscreen", updateFullscreenButton);
      video.addEventListener("webkitendfullscreen", updateFullscreenButton);

      updatePlayButton();
      updateVolumeButton();
      updateProgress();
      updateFullscreenButton();
    }

    if (settings.interactive) {
      player.addEventListener("click", (event) => {
        if (event.target.closest(".custom-video-controls")) return;
        player.focus({ preventScroll: true });
        togglePlayback();
      });
      player.addEventListener("keydown", (event) => {
        if (
          !["Enter", " "].includes(event.key) ||
          event.repeat ||
          event.target.closest(".custom-video-controls")
        ) {
          return;
        }

        event.preventDefault();
        togglePlayback();
      });
    }

    if (settings.autoplay) {
      video.play().catch((error) => {
        if (error.name === "NotAllowedError" && !video.muted) {
          video.muted = true;
          updateVolumeButton();
          video.play().catch(reportPlaybackError);
          return;
        }
        reportPlaybackError(error);
      });
    }

    return player;
  }

  function initializeMarkedVideos(root) {
    if (root instanceof HTMLVideoElement && root.matches("video[data-video-player]")) {
      initialize(root);
    }

    root.querySelectorAll?.("video[data-video-player]").forEach((video) => {
      initialize(video);
    });
  }

  window.VideoPlayer = {
    initialize,
    initializeWithin: initializeMarkedVideos,
    prepareThumbnail
  };

  function observeVideoPlayers() {
    initializeMarkedVideos(document);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            initializeMarkedVideos(node);
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeVideoPlayers, { once: true });
  } else {
    observeVideoPlayers();
  }
})();
