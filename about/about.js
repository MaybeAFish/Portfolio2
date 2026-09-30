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

    if (!previewTemplate) {
      card.addEventListener("touchstart", (e) => {
        e.stopPropagation();
        hidePreview();
      }, { passive: true });
      return;
    }

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
      preview.classList.remove("is-visible");
    });

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

  // Close the preview if the page scrolls instead of blocking scroll
  window.addEventListener("scroll", () => {
    if (activeCard) hidePreview();
  }, { passive: true });
}



function initialiseEyeball() {
  const eyeball = document.querySelector(".eyeball");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let lookAngle = 0;

  const PROJECTILE_IMAGE = "/about/art/pixelart/eyeballProjectile.png";
  const PROJECTILE_SPEED = 5000;
  const SHOOT_INTERVAL = 2000;
  const POOL_SIZE = 3;

  const projectilePool = Array.from({ length: POOL_SIZE }, () => {
    const element = document.createElement("img");

    element.src = PROJECTILE_IMAGE;
    element.className = "eyeball-projectile";
    element.alt = "";
    element.draggable = false;

    document.body.appendChild(element);

    return {
      element,
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0
    };
  });

  function updateEyeball(x, y) {
    const rect = eyeball.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    lookAngle = Math.atan2(y - centerY, x - centerX) - Math.PI / 2;

    eyeball.style.transform = `rotate(${lookAngle}rad)`;
  }

  function shootProjectile() {
    const rect = eyeball.getBoundingClientRect();

    const margin = 100;

    if (
      rect.right < -margin ||
      rect.left > window.innerWidth + margin ||
      rect.bottom < -margin ||
      rect.top > window.innerHeight + margin
    ) {
      return;
    }

    const projectile = projectilePool.find(
      projectile => !projectile.active
    );

    if (!projectile) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const directionX = -Math.sin(lookAngle);
    const directionY = Math.cos(lookAngle);

    projectile.x = centerX;
    projectile.y = centerY;

    projectile.vx = directionX * PROJECTILE_SPEED;
    projectile.vy = directionY * PROJECTILE_SPEED;

    projectile.active = true;

    projectile.element.style.display = "block";
    projectile.element.style.left = `${centerX}px`;
    projectile.element.style.top = `${centerY}px`;
  }

  function updateProjectiles(deltaTime) {
    const margin = 100;

    for (const projectile of projectilePool) {
      if (!projectile.active) continue;

      projectile.x += projectile.vx * deltaTime;
      projectile.y += projectile.vy * deltaTime;

      const angle = Math.atan2(
        projectile.vy,
        projectile.vx
      );

      projectile.element.style.left = `${projectile.x}px`;
      projectile.element.style.top = `${projectile.y}px`;
      projectile.element.style.transform = `
        translate(-50%, -50%)
        rotate(${angle + Math.PI / 2}rad)      
      `;

      // Recycle once it completely left screen.
      if (
        projectile.x < -margin ||
        projectile.x > window.innerWidth + margin ||
        projectile.y < -margin ||
        projectile.y > window.innerHeight + margin
      ) {
        projectile.active = false;
        projectile.element.style.display = "none";
      }
    }
  }

  let lastTime = performance.now();

  function projectileLoop(time) {
    const deltaTime = Math.min(
      (time - lastTime) / 1000,
      0.05
    );

    lastTime = time;

    updateProjectiles(deltaTime);

    requestAnimationFrame(projectileLoop);
  }

  requestAnimationFrame(projectileLoop);

  // Shoot .
  shootProjectile();
  setInterval(shootProjectile, SHOOT_INTERVAL);


  // Mobile support and resizing the shizzle
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