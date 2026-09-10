document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".slideshow").forEach(setupSlideshow);
});

function setupSlideshow(slideshow) {
  if (slideshow.querySelector(".slideshow-controls")) return;

  const track = slideshow.querySelector(".slideshow-track");

  if (!track) return;

  const slides = Array.from(
    track.querySelectorAll(".slideshow-slide")
  );

  if (!slides.length) return;

  let currentSlide = 0;

  /* -------------------------
     Controls
  ------------------------- */

  const controls = document.createElement("div");
  controls.className = "slideshow-controls";

  const previousButton = createArrowButton(
    "Previous slide",
    "prev"
  );

  const nextButton = createArrowButton(
    "Next slide",
    "next"
  );

  const dots = document.createElement("div");
  dots.className = "slideshow-dots";
  dots.setAttribute("role", "tablist");
  dots.setAttribute("aria-label", "Slides");

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "slideshow-dot";

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

  slideshow.appendChild(controls);

  /* -------------------------
     Update slideshow
  ------------------------- */

  function updateSlideshow() {
    const totalSlides = slides.length;

    slides.forEach((slide, index) => {
      let difference = index - currentSlide;

      /*
       * Make the slideshow wrap around.
       *
       * Example with 5 slides:
       * 0 -> -1 becomes previous
       * 4 -> +1 becomes next
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

      /*
       * Only the active and adjacent slides
       * can be interacted with.
       */
      slide.style.zIndex = isActive
        ? "2"
        : isPrevious || isNext
          ? "1"
          : "0";

      slide.onclick = null;

      if (isPrevious || isNext) {
        slide.onclick = () => {
          goToSlide(index);
        };
      }
    });

    /* Update dots */
    const dotElements =
      dots.querySelectorAll(".slideshow-dot");

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

    slideshow.dataset.activeSlide =
      String(currentSlide);

    slideshow.dataset.category =
      slides[currentSlide].dataset.category ||
      slideshow.dataset.category ||
      "default";
  }

  /* -------------------------
     Navigation
  ------------------------- */

  function goToSlide(index) {
    currentSlide =
      (index + slides.length) %
      slides.length;

    updateSlideshow();
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

  slideshow.addEventListener(
    "keydown",
    handleKeyboard
  );

  slideshow.tabIndex = 0;

  /* Initial state */
  updateSlideshow();
}


/* -------------------------
   Arrow button
------------------------- */

function createArrowButton(label, direction) {
  const button = document.createElement("button");

  button.type = "button";

  button.className =
    `slideshow-button ${direction}`;

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