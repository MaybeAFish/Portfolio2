document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".mediacarousel, .textcarousel")
    .forEach(setupCarousel);

  initialiseGameCharacters();
  initialiseEyeball();
});


// SPECIFIC SHIZZLE
function initialiseGameCharacters() {
  const preview = document.querySelector(".hover-preview");
  let activeCard = null;

  function positionPreview(x, y) {
    const margin = 18;
    const offset = 18;
    const previewRect = preview.getBoundingClientRect();

    const left = Math.min(x + offset, window.innerWidth - previewRect.width - margin);
    const top = Math.min(y + offset, window.innerHeight - previewRect.height - margin);

    preview.style.setProperty("--preview-left", `${Math.max(margin, left)}px`);
    preview.style.setProperty("--preview-top", `${Math.max(margin, top)}px`);
  }

  function showPreview(template, x, y) {
    preview.innerHTML = template.innerHTML;
    preview.classList.add("is-visible");
    positionPreview(x, y);
  }

  function hidePreview() {
    preview.classList.remove("is-visible");
    if (activeCard) activeCard.classList.remove("is-selected");
    activeCard = null;
  }

  document.querySelectorAll(".game-card").forEach((card) => {
    const previewTemplate = card.querySelector(".game-hover");
    if (!previewTemplate) return;

    // Desktop: mouse only follows cursor
    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      showPreview(previewTemplate, event.clientX, event.clientY);
    });

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      positionPreview(event.clientX, event.clientY);
    });

    card.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse") return;
      hidePreview();
    });

    // Mobile: tap toggles positioned at the tap point
    card.addEventListener("touchstart", (e) => {
      e.stopPropagation();
      const touch = e.touches[0];

      if (activeCard === card) {
        hidePreview();
        return;
      }
      if (activeCard) activeCard.classList.remove("is-selected");
      activeCard = card;
      card.classList.add("is-selected");
      showPreview(previewTemplate, touch.clientX, touch.clientY);
    }, { passive: true });
  });

  document.addEventListener("touchstart", (e) => {
    if (!e.target.closest(".game-card")) hidePreview();
  }, { passive: true });
}

function initialiseEyeball() {
  const eyeball = document.querySelector(".eyeball");

  function updateEyeball(x, y) {
    const rect = eyeball.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(y - centerY, x - centerX) - Math.PI / 2;

    eyeball.style.transform = `rotate(${angle}rad)`;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateEyeball(mouseX, mouseY);
  });

  document.addEventListener("touchstart", (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    updateEyeball(mouseX, mouseY);
  }, { passive: true });

  document.addEventListener("touchmove", (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    updateEyeball(mouseX, mouseY);
  }, { passive: true });

  window.addEventListener("scroll", () => {
    updateEyeball(mouseX, mouseY);
  });

  window.addEventListener("resize", () => {
    updateEyeball(mouseX, mouseY);
  });

  updateEyeball(mouseX, mouseY);
}

// function logAnimations() {
//   document.querySelectorAll("model-viewer").forEach((model) => {
//     model.addEventListener("load", () => {
//       console.log(model.src, model.availableAnimations);
//     });
//   });
// }