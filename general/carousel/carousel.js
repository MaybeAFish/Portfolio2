document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".carousel").forEach(setupCarousel);
});

function setupCarousel(carousel) {
  if (carousel.querySelector(".carousel-controls")) return;

  const track = carousel.querySelector(".carousel-track");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(".carousel-slide"));
  if (!slides.length) return;

  let currentSlide = 0;
  const controls = document.createElement("div");
  controls.className = "carousel-controls";

  const previousButton = createButton("Previous slide", "\u276e");
  const nextButton = createButton("Next slide", "\u276f");
  previousButton.className = "carousel-button prev";
  nextButton.className = "carousel-button next";
  const dots = document.createElement("div");
  dots.className = "carousel-dots";
  dots.setAttribute("role", "tablist");

  slides.forEach((slide, index) => {
    const dot = createButton(`Go to slide ${index + 1}`, "");
    dot.className = "carousel-dot";
    dot.setAttribute("role", "tab");
    dot.addEventListener("click", () => goToSlide(index));
    dots.appendChild(dot);
  });

  controls.append(previousButton, dots, nextButton);
  carousel.appendChild(controls);

  function updateCarousel(behavior = "smooth") {
    track.scrollTo({
      left: currentSlide * track.clientWidth,
      behavior,
    });
    dots.querySelectorAll(".carousel-dot").forEach((dot, index) => {
      const active = index === currentSlide;
      dot.classList.toggle("active", active);
      dot.setAttribute("aria-selected", String(active));
    });
    carousel.dataset.activeSlide = String(currentSlide);
    carousel.dataset.category = slides[currentSlide].dataset.category || "default";
  }

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    updateCarousel();
  }

  function handleKeyboard(event) {
    if (event.key === "ArrowRight") goToSlide(currentSlide + 1);
    if (event.key === "ArrowLeft") goToSlide(currentSlide - 1);
  }

  function syncWithScroll() {
    const newIndex = Math.round(track.scrollLeft / track.clientWidth);
    if (newIndex !== currentSlide) {
      currentSlide = newIndex;
      updateCarousel("auto");
    }
  }

  previousButton.addEventListener("click", () => goToSlide(currentSlide - 1));
  nextButton.addEventListener("click", () => goToSlide(currentSlide + 1));
  carousel.addEventListener("keydown", handleKeyboard);
  track.addEventListener("scrollend", syncWithScroll);
  window.addEventListener("resize", () => updateCarousel("auto"));

  carousel.tabIndex = 0;
  updateCarousel("auto");
}

function createButton(label, content) {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.textContent = content;
  return button;
}
