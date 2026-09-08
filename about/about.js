const sections = document.querySelectorAll("[data-section]");
Promise.all(
  [...sections].map(async (slot) => {
    const sectionName = slot.dataset.section;
    const response = await fetch(`/about/${sectionName}/${sectionName}.html`);

    if (response.ok) {
      slot.innerHTML = await response.text();
      slot.querySelectorAll(".carousel").forEach(setupCarousel);
    }

    if (sectionName === "fav_games") {
      initialiseGameCharacters();
    }
    if (sectionName === "art") {
      initialiseEyeball();
    }
  }),
).then(() => {
  const savedScroll = sessionStorage.getItem("about-scroll");

  if (savedScroll !== null) {
    window.scrollTo(0, Number(savedScroll));
  }
});

window.addEventListener("scroll", () => {
  sessionStorage.setItem("about-scroll", String(window.scrollY));
});



// SPECIFIC SHIZZLE
function initialiseGameCharacters() {
  const preview = document.querySelector(".hover-preview");

  function positionPreview(event) {
    const margin = 18;
    const offset = 18;
    const previewRect = preview.getBoundingClientRect();
    const left = Math.min(
      event.clientX + offset,
      window.innerWidth - previewRect.width - margin,
    );
    const top = Math.min(
      event.clientY + offset,
      window.innerHeight - previewRect.height - margin,
    );

    preview.style.setProperty("--preview-left", `${Math.max(margin, left)}px`);
    preview.style.setProperty("--preview-top", `${Math.max(margin, top)}px`);
  }

  document.querySelectorAll(".game-card").forEach((card) => {
    const previewTemplate = card.querySelector(".game-hover");

    if (!previewTemplate) {
      return;
    }

    card.addEventListener("pointerenter", () => {
      preview.innerHTML = previewTemplate.innerHTML;
      preview.classList.add("is-visible");
    });

    card.addEventListener("pointermove", (event) => {
      positionPreview(event);
    });

    card.addEventListener("pointerleave", () => {
      preview.classList.remove("is-visible");
    });
  });
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
  window.addEventListener("scroll", () => updateEyeball(mouseX, mouseY));
  window.addEventListener("resize", () => updateEyeball(mouseX, mouseY));
}

// function logAnimations() {
//   document.querySelectorAll("model-viewer").forEach((model) => {
//     model.addEventListener("load", () => {
//       console.log(model.src, model.availableAnimations);
//     });
//   });
// }