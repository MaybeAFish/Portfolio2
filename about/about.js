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

function showPreview(card) {
    const template = card.querySelector("template.game-hover");
    if (!template) return;

    preview.innerHTML = "";
    preview.appendChild(template.content.cloneNode(true));

    const rect = card.getBoundingClientRect();
    const previewRect = preview.getBoundingClientRect(); // after content injected

    let left = rect.left + rect.width / 2 - previewRect.width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - previewRect.width - 12));

    let top = rect.bottom + 10;
    // flip above if it would overflow bottom of viewport
    if (top + previewRect.height > window.innerHeight - 12) {
        top = rect.top - previewRect.height - 10;
    }

    preview.style.setProperty("--preview-left", `${left}px`);
    preview.style.setProperty("--preview-top", `${top}px`);
    preview.classList.add("is-visible");
}

function hidePreview() {
    preview.classList.remove("is-visible");
    if (activeCard) activeCard.classList.remove("is-selected");
    activeCard = null;
}

document.querySelectorAll(".game-card").forEach((card) => {
    // desktop
    card.addEventListener("mouseenter", () => showPreview(card));
    card.addEventListener("mouseleave", hidePreview);

    // mobile
    card.addEventListener("touchstart", (e) => {
        e.stopPropagation();
        if (activeCard === card) {
            hidePreview();
            return;
        }
        if (activeCard) activeCard.classList.remove("is-selected");
        activeCard = card;
        card.classList.add("is-selected");
        showPreview(card);
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