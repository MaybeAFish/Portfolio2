  // Swiping
  let pointerStartX = 0;
  let pointerStartY = 0;
  let isDragging = false;
  let gestureDirection = null;

  carousel.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;

    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    isDragging = true;
    gestureDirection = null;

    carousel.setPointerCapture(e.pointerId);
  });

  carousel.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - pointerStartX;
    const deltaY = e.clientY - pointerStartY;

    // Wait until the gesture has a clear direction
    if (!gestureDirection) {
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        return;
      }

      gestureDirection =
        Math.abs(deltaX) > Math.abs(deltaY)
          ? "horizontal"
          : "vertical";
    }

    // Once vertical scrolling starts, let Safari handle it
    if (gestureDirection === "vertical") {
      return;
    }

    // Horizontal gesture: stop the page from moving
    e.preventDefault();

    // Move carousel immediately while dragging
    const dragProgress = deltaX / carousel.offsetWidth;

    slides.forEach((slide, index) => {
      let difference = index - currentSlide;

      if (difference > slides.length / 2) {
        difference -= slides.length;
      }

      if (difference < -slides.length / 2) {
        difference += slides.length;
      }

      if (difference === 0) {
        slide.style.transform =
          `translateX(${dragProgress * 100}%)`;
      }
    });
  });

  carousel.addEventListener("pointerup", (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - pointerStartX;

    isDragging = false;

    if (gestureDirection !== "horizontal") {
      gestureDirection = null;
      return;
    }

    if (Math.abs(deltaX) >= 50) {
      if (deltaX < 0) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(currentSlide - 1);
      }
    } else {
      updateCarousel();
    }

    gestureDirection = null;
  });

  carousel.addEventListener("pointercancel", () => {
    isDragging = false;
    gestureDirection = null;
    updateCarousel();
  });