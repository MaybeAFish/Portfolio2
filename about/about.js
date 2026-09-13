const sections = document.querySelectorAll("[data-section]");
Promise.all(
  [...sections].map(async (slot) => {
    const sectionName = slot.dataset.section;
    const response = await fetch(`/about/${sectionName}/${sectionName}.html`);

    if (response.ok) {
      slot.innerHTML = await response.text();
      slot
        .querySelectorAll(".mediacarousel, .textcarousel")
        .forEach(setupCarousel);
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
  let activeCard = null;
  let touchStartY = 0;

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

  function closePreview() {
    activeCard = null;
    preview.classList.remove("is-visible");
  }

  document.querySelectorAll(".game-card").forEach((card) => {
    const previewTemplate = card.querySelector(".game-hover");

    if (!previewTemplate) {
      return;
    }

    // Desktop hover
    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") {
        preview.innerHTML = previewTemplate.innerHTML;
        preview.classList.add("is-visible");
      }
    });

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "mouse") {
        positionPreview(event);
      }
    });

    card.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") {
        closePreview();
      }
    });

    // Touch
    card.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") {
        touchStartY = event.clientY;
      }
    });

    card.addEventListener("click", (event) => {
      if (event.pointerType !== "touch") {
        return;
      }
      // If the user was scrolling, don't open the preview.
      if (Math.abs(event.clientY - touchStartY) > 10) {
        closePreview();
        return;
      }

      if (activeCard === card) {
        closePreview();
        return;
      }

      activeCard = card;
      preview.innerHTML = previewTemplate.innerHTML;
      preview.classList.add("is-visible");

      // Put it somewhere sensible on mobile.
      const rect = card.getBoundingClientRect();
      preview.style.setProperty(
        "--preview-left",
        `${Math.max(12, Math.min(rect.left, window.innerWidth - preview.offsetWidth - 12))}px`
      );
      preview.style.setProperty(
        "--preview-top",
        `${Math.min(rect.bottom + 12, window.innerHeight - preview.offsetHeight - 12)}px`
      );
    });
  });

  // scrolling always closes the touch preview.
  window.addEventListener(
    "scroll",
    () => {
      if (activeCard) {
        closePreview();
      }
    },
    { passive: true },
  );
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