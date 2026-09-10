document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".mediacarousel, .textcarousel")
    .forEach(setupCarousel);
});

function setupCarousel(carousel) {
  if (carousel.querySelector(".carousel-controls")) return;
  if (carousel.querySelector(".mediacarousel-controls")) return;
  if (carousel.querySelector(".textcarousel-controls")) return;

  const isMediaCarousel =
    carousel.classList.contains("mediacarousel");

  const prefix = isMediaCarousel
    ? "mediacarousel"
    : "textcarousel";

  const track = carousel.querySelector(`.${prefix}-track`);

  if (!track) return;

  const slides = Array.from(
    track.querySelectorAll(`.${prefix}-slide`)
  );

  if (!slides.length) return;

  let currentSlide = 0;

  /* -------------------------
     Controls
  ------------------------- */

  const controls = document.createElement("div");
  controls.className = `${prefix}-controls`;

  const previousButton = createArrowButton(
    "Previous slide",
    "prev",
    prefix
  );

  const nextButton = createArrowButton(
    "Next slide",
    "next",
    prefix
  );

  const dots = document.createElement("div");

  dots.className = `${prefix}-dots`;
  dots.setAttribute("role", "tablist");
  dots.setAttribute("aria-label", "Slides");

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = `${prefix}-dot`;

    dot.setAttribute(
      "aria-label",
      `Go to slide ${index + 1}`
    );

    dot.setAttribute("aria-selected", "false");
    dot.setAttribute("role", "tab");

    dot.addEventListener("click", () => {
      goToSlide(index);
    });

    dots.appendChild(dot);
  });

  controls.append(
    previousButton,
    dots,
    nextButton
  );

  carousel.appendChild(controls);

  /* -------------------------
     Update carousel
  ------------------------- */

  function updateCarousel() {
    const totalSlides = slides.length;

    slides.forEach((slide, index) => {
      let difference = index - currentSlide;

      /*
       * Wrap around so the first and last
       * slides remain adjacent.
       */
      if (difference > totalSlides / 2) {
        difference -= totalSlides;
      }

      if (difference < -totalSlides / 2) {
        difference += totalSlides;
      }

      const isActive = difference === 0;
      const isPrevious = difference === -1;
      const isNext = difference === 1;

      slide.classList.toggle(
        "is-active",
        isActive
      );

      slide.classList.toggle(
        "is-prev",
        isPrevious
      );

      slide.classList.toggle(
        "is-next",
        isNext
      );

      slide.setAttribute(
        "aria-hidden",
        String(!isActive)
      );

      slide.style.zIndex = isActive
        ? "2"
        : isPrevious || isNext
          ? "1"
          : "0";

      /*
       * Only the side slides are clickable.
       */
      slide.onclick = null;

      if (isPrevious || isNext) {
        slide.onclick = () => {
          goToSlide(index);
        };
      }
    });

    /* Update dots */

    const dotElements =
      dots.querySelectorAll(`.${prefix}-dot`);

    dotElements.forEach((dot, index) => {
      const active = index === currentSlide;

      dot.classList.toggle(
        "active",
        active
      );

      dot.setAttribute(
        "aria-selected",
        String(active)
      );

      dot.setAttribute(
        "aria-current",
        active ? "true" : "false"
      );
    });

    carousel.dataset.activeSlide =
      String(currentSlide);
  }

  /* -------------------------
     Navigation
  ------------------------- */

  function goToSlide(index) {
    currentSlide =
      (index + slides.length) %
      slides.length;

    updateCarousel();
  }

  /* -------------------------
     Keyboard navigation
  ------------------------- */

  function handleKeyboard(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(currentSlide - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(currentSlide + 1);
    }
  }

  previousButton.addEventListener(
    "click",
    () => {
      goToSlide(currentSlide - 1);
    }
  );

  nextButton.addEventListener(
    "click",
    () => {
      goToSlide(currentSlide + 1);
    }
  );

  carousel.addEventListener(
    "keydown",
    handleKeyboard
  );

  carousel.tabIndex = 0;

  /* Initial state */

  updateCarousel();
}


/* =========================================================
   ARROW BUTTON
   ========================================================= */

function createArrowButton(label, direction, prefix) {
  const button = document.createElement("button");

  button.type = "button";

  button.className =
    `${prefix}-button ${direction}`;

  button.setAttribute(
    "aria-label",
    label
  );

  button.innerHTML =
    direction === "prev"
      ? `
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M15 5l-7 7 7 7"/>
        </svg>
      `
      : `
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M9 5l7 7-7 7"/>
        </svg>
      `;

  return button;
}