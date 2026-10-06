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


  if (
    !main ||
    !current ||
    !thumbsContainer ||
    !thumbs.length
  ) {
    return;
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

  function freezeThumbnailVideo(video) {

    video.muted = true;
    video.pause();

    try {
      video.currentTime = 0;
    } catch {
      /* Ignore videos that are not seekable yet. */
    }
  }


  function prepareThumbnailVideo(video) {

    video.muted = true;
    video.pause();
    video.controls = false;

    /*
     * Try to get the first frame without playing it.
     */
    video.addEventListener(
      "loadedmetadata",
      () => {

        try {
          video.currentTime = 0;
        } catch {
          /* Ignore. */
        }

      },
      { once: true }
    );


    video.addEventListener(
      "loadeddata",
      () => {
        freezeThumbnailVideo(video);
      }
    );
  }


  function createMainMedia(thumb) {

    const source = thumb.querySelector("img, video");

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
    }

    if (media.tagName === "VIDEO") {

      media.muted = true;
      media.autoplay = true;
      media.loop = true;
      media.controls = false;
      media.playsInline = true;

      media.setAttribute("playsinline", "");
      media.setAttribute("muted", "");
      media.setAttribute("autoplay", "");
      media.setAttribute("loop", "");


      media.addEventListener(
        "loadeddata",
        () => {
          media.play().catch(() => {
            /*
             * Browser may still reject autoplay.
             * The video remains usable as a still frame.
             */
          });
        },
        { once: true }
      );

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


  /* =========================================================
     MAIN MEDIA UPDATE
     ========================================================= */

  function updateMain(index, options = {}) {

    const {
      scrollThumb = true
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

      current.replaceChildren(media);

      main.setAttribute(
        "aria-label",
        activeThumb.dataset.title ||
        `Media ${currentIndex + 1}`
      );

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


    carousel.dataset.activeSlide =
      String(currentIndex);

  }


  /* =========================================================
     NAVIGATION
     ========================================================= */

  function goToSlide(index) {

    updateMain(index, {
      scrollThumb: true
    });

  }


  /* =========================================================
     BUTTONS
     ========================================================= */

  if (prevButton) {

    prevButton.addEventListener(
      "click",
      () => {
        goToSlide(currentIndex - 1);
      }
    );

  }


  if (nextButton) {

    nextButton.addEventListener(
      "click",
      () => {
        goToSlide(currentIndex + 1);
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
      prepareThumbnailVideo(video);
    }

  });


  /* =========================================================
     MOUSE / TOUCH DRAGGING
     ========================================================= */

  thumbsContainer.addEventListener(
    "pointerdown",
    (event) => {

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
        event.target.tagName === "BUTTON"
      ) {
        return;
      }


      if (event.key === "ArrowLeft") {

        event.preventDefault();

        goToSlide(
          currentIndex - 1
        );

      }


      if (event.key === "ArrowRight") {

        event.preventDefault();

        goToSlide(
          currentIndex + 1
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