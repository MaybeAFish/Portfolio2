document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".mediacarousel[data-carousel]")
    .forEach(setupMediaCarousel);
});


function setupMediaCarousel(carousel) {

  const main = carousel.querySelector(".mediacarousel-main");
  const current = carousel.querySelector(".mediacarousel-current");
  const thumbsContainer = carousel.querySelector(".mediacarousel-thumbs");

  const prevButton = carousel.querySelector(".mediacarousel-button--prev");
  const nextButton = carousel.querySelector(".mediacarousel-button--next");

  const counter = carousel.querySelector(".mediacarousel-counter");

  const thumbs = Array.from(
    carousel.querySelectorAll(".mediacarousel-thumb")
  );

  const infoItems = Array.from(
    carousel.querySelectorAll(".mediacarousel-info-item")
  );

  function addCornerArtwork(target, area) {
    if (!target) return;

    const artwork = document.createElement("span");
    artwork.className = `carousel-corner-art carousel-corner-art--${area}`;
    artwork.setAttribute("aria-hidden", "true");

    ["top-left", "top-right", "bottom-left", "bottom-right"].forEach((corner) => {
      const piece = document.createElement("span");
      piece.className = `carousel-corner-art__piece carousel-corner-art__piece--${corner}`;
      artwork.append(piece);
    });

    target.append(artwork);
  }

  if (
    !main ||
    !current ||
    !thumbsContainer ||
    !thumbs.length
  ) {
    return;
  }

  if (carousel.classList.contains("mediacarousel--corner-art")) {
    addCornerArtwork(main, "media");
    addCornerArtwork(carousel.querySelector(".mediacarousel-info"), "info");
    thumbs.forEach((thumb) => addCornerArtwork(thumb, "thumb"));
  }

  let touchControlsTimeout;
  let touchControlsPointerId = null;

  function showTouchCarouselControls() {
    main.classList.add("is-controls-visible");
    clearTimeout(touchControlsTimeout);
  }

  function hideTouchCarouselControls() {
    clearTimeout(touchControlsTimeout);
    touchControlsTimeout = setTimeout(() => {
      main.classList.remove("is-controls-visible");
    }, 3000);
  }

  main.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;

    touchControlsPointerId = event.pointerId;
    showTouchCarouselControls();
    window.addEventListener("pointerup", finishTouchCarouselControls);
    window.addEventListener("pointercancel", finishTouchCarouselControls);
  });

  function finishTouchCarouselControls(event) {
    if (event.pointerId !== touchControlsPointerId) return;

    touchControlsPointerId = null;
    hideTouchCarouselControls();
    window.removeEventListener("pointerup", finishTouchCarouselControls);
    window.removeEventListener("pointercancel", finishTouchCarouselControls);
  }

  /* =========================================================
     STATE
     ========================================================= */

  let currentIndex = 0;

  let pointerId = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerStartScrollLeft = 0;

  let isDragging = false;
  let axisLocked = null;

  let suppressNextClick = false;


  /* =========================================================
     MEDIA HELPERS
     ========================================================= */

  function createMainMedia(thumb) {

    const source = thumb.querySelector(".mediacarousel-text-source, img, video");

    if (!source) {
      return null;
    }

    const media = source.cloneNode(true);
    media.removeAttribute("loading");
    media.draggable = false;


    if (media.tagName === "IMG") {
      media.alt =
        thumb.dataset.title ||
        source.alt ||
        "";
    } else if (source.classList.contains("mediacarousel-text-source")) {
      media.classList.add("mediacarousel-text-slide");
    }

    return media;
  }

  /* =========================================================
     INFO PANEL
     ========================================================= */

  function updateInfo(index) {

    infoItems.forEach((item) => {

      const itemIndex =
        Number(item.dataset.slide);

      const active =
        itemIndex === index;

      item.classList.toggle(
        "is-active",
        active
      );

      item.setAttribute(
        "aria-hidden",
        String(!active)
      );

    });
  }


  /* =========================================================
     THUMBNAIL STATE
     ========================================================= */

  function updateThumbs(index) {

    thumbs.forEach((thumb, thumbIndex) => {

      const active =
        thumbIndex === index;

      thumb.classList.toggle(
        "is-active",
        active
      );

      thumb.setAttribute(
        "aria-selected",
        String(active)
      );

      thumb.setAttribute(
        "tabindex",
        active ? "0" : "-1"
      );

    });

  }

  function wrapButtonIcons() {
    const carouselVariant = ["doomed", "tetris", "engine"]
      .find((variant) => carousel.classList.contains(variant));

    carousel.querySelectorAll(".mediacarousel-button svg").forEach((icon) => {
      if (icon.parentElement.classList.contains("mediacarousel-button-icon")) return;
      const wrapper = document.createElement("span");
      wrapper.className = "mediacarousel-button-icon";
      if (carouselVariant) {
        const direction = icon.closest(".mediacarousel-button--prev") ? "prev" : "next";
        wrapper.classList.add(`mediacarousel-button-icon--${carouselVariant}-${direction}`);
      }
      icon.before(wrapper);
      wrapper.append(icon);
    });
  }

  wrapButtonIcons();


  /* =========================================================
     MAIN MEDIA UPDATE
     ========================================================= */

  function updateMain(index, options = {}) {

    const {
      scrollThumb = true,
      focusThumb = false
    } = options;


    currentIndex =
      (index + thumbs.length) %
      thumbs.length;


    const activeThumb =
      thumbs[currentIndex];


    updateThumbs(currentIndex);
    updateInfo(currentIndex);


    /* -------------------------
       Counter
       ------------------------- */

    if (counter) {

      counter.textContent =
        `${currentIndex + 1} / ${thumbs.length}`;

    }


    /* -------------------------
       Main media
       ------------------------- */

    const media =
      createMainMedia(activeThumb);

    if (media) {
      current.querySelectorAll("video").forEach((video) => video.pause());
      let displayMedia = media;

      if (media instanceof HTMLVideoElement) {
        if (!window.VideoPlayer) {
          throw new Error("The shared video player must load before the media carousel.");
        }

        media.muted = false;
        media.preload = "auto";
        displayMedia = window.VideoPlayer.initialize(media, {
          controls: activeThumb.dataset.controls !== "false",
          volumeButton: activeThumb.dataset.volumeButton !== "false",
          volume: activeThumb.dataset.volume,
          fit: activeThumb.dataset.fit,
          blurredBackground: activeThumb.dataset.blurredBackground === "true",
          autoplay: true,
          loop: true
        });
      }

      current.replaceChildren(displayMedia);

    }


    /* -------------------------
       Scroll active thumbnail
       ------------------------- */

    if (scrollThumb) {

      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });

    }

    if (focusThumb) {
      activeThumb.focus({ preventScroll: true });
    }


    carousel.dataset.activeSlide =
      String(currentIndex);

  }


  /* =========================================================
     NAVIGATION
     ========================================================= */

  function goToSlide(index, options = {}) {

    updateMain(index, {
      scrollThumb: options.scrollThumb ?? true,
      focusThumb: options.focusThumb ?? false
    });

  }


  /* =========================================================
     BUTTONS
     ========================================================= */

  if (prevButton) {

    prevButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        goToSlide(currentIndex - 1, { scrollThumb: false });
      }
    );

  }


  if (nextButton) {

    nextButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        goToSlide(currentIndex + 1, { scrollThumb: false });
      }
    );

  }


  /* =========================================================
     THUMBNAIL CLICKS
     ========================================================= */

  thumbs.forEach((thumb, index) => {

    thumb.addEventListener(
      "click",
      (event) => {

        if (suppressNextClick) {

          event.preventDefault();

          suppressNextClick = false;

          return;
        }


        goToSlide(index);

      }
    );


    const video =
      thumb.querySelector("video");

    if (video) {
      window.VideoPlayer.prepareThumbnail(video);
    }

  });


  /* =========================================================
     MOUSE / TOUCH DRAGGING
     ========================================================= */

  thumbsContainer.addEventListener(
    "pointerdown",
    (event) => {

      if (event.pointerType !== "mouse") {
        return;
      }

      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }


      pointerId = event.pointerId;

      pointerStartX =
        event.clientX;

      pointerStartY =
        event.clientY;

      pointerStartScrollLeft =
        thumbsContainer.scrollLeft;

      isDragging = true;
      axisLocked = null;

    }
  );


  thumbsContainer.addEventListener(
    "pointermove",
    (event) => {

      if (
        !isDragging ||
        event.pointerId !== pointerId
      ) {
        return;
      }


      const deltaX =
        event.clientX -
        pointerStartX;

      const deltaY =
        event.clientY -
        pointerStartY;


      /* -------------------------
         Determine gesture axis
         ------------------------- */

      if (!axisLocked) {

        if (
          Math.abs(deltaX) < 8 &&
          Math.abs(deltaY) < 8
        ) {
          return;
        }


        axisLocked =
          Math.abs(deltaX) >
          Math.abs(deltaY)
            ? "x"
            : "y";

        if (axisLocked === "x") {
          thumbsContainer.classList.add(
            "is-dragging"
          );

          thumbsContainer.setPointerCapture(
            event.pointerId
          );
        }

      }


      /* -------------------------
         Horizontal drag
         ------------------------- */

      if (axisLocked === "x") {

        event.preventDefault();

        thumbsContainer.scrollLeft =
          pointerStartScrollLeft -
          deltaX;


        suppressNextClick = true;

      }

    }
  );


  function endPointerDrag(event) {

    if (
      !isDragging ||
      event.pointerId !== pointerId
    ) {
      return;
    }


    isDragging = false;

    axisLocked = null;

    thumbsContainer.classList.remove(
      "is-dragging"
    );


    try {
      thumbsContainer.releasePointerCapture(
        event.pointerId
      );
    } catch {
      /* Ignore. */
    }


    pointerId = null;


    /*
     * Wait until the click event has passed.
     */
    if (suppressNextClick) {

      setTimeout(() => {
        suppressNextClick = false;
      }, 0);

    }

  }


  thumbsContainer.addEventListener(
    "pointerup",
    endPointerDrag
  );


  thumbsContainer.addEventListener(
    "pointercancel",
    endPointerDrag
  );


  thumbsContainer.addEventListener(
    "lostpointercapture",
    endPointerDrag
  );


  /* =========================================================
     MOUSEWHEEL
     ========================================================= */

  thumbsContainer.addEventListener(
    "wheel",
    (event) => {

      const wheelDelta =
        Math.abs(event.deltaX) >
        Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;


      if (wheelDelta === 0) {
        return;
      }

      const deltaScale =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? thumbsContainer.clientWidth
            : 1;

      const scrollAmount =
        wheelDelta * deltaScale;

      const maxScrollLeft =
        thumbsContainer.scrollWidth -
        thumbsContainer.clientWidth;

      if (maxScrollLeft <= 1) {
        return;
      }

      const currentScrollLeft =
        thumbsContainer.scrollLeft;

      const nextScrollLeft =
        Math.max(
          0,
          Math.min(
            maxScrollLeft,
            currentScrollLeft + scrollAmount
          )
        );

      if (
        Math.abs(nextScrollLeft - currentScrollLeft) < 0.5
      ) {
        return;
      }

      event.preventDefault();

      thumbsContainer.scrollLeft =
        nextScrollLeft;

    },
    {
      passive: false
    }
  );


  /* =========================================================
     KEYBOARD
     ========================================================= */

  carousel.addEventListener(
    "keydown",
    (event) => {

      if (
        event.target.closest(".custom-video-controls") ||
        event.target.matches("input, select, textarea, [contenteditable='true']")
      ) {
        return;
      }


      if (event.key === "ArrowLeft") {

        event.preventDefault();

        goToSlide(
          currentIndex - 1,
          { scrollThumb: true, focusThumb: true }
        );

      }


      if (event.key === "ArrowRight") {

        event.preventDefault();

        goToSlide(
          currentIndex + 1,
          { scrollThumb: true, focusThumb: true }
        );

      }

    }
  );


  /* =========================================================
     INITIAL STATE
     ========================================================= */

  updateMain(0, {
    scrollThumb: false
  });

}