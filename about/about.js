document.addEventListener("DOMContentLoaded", () => {
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

  const PROJECTILE_SPEED = 500;
  const HOMING_STRENGTH = 3.5;
  const SHOOT_INTERVAL = 2000;
  const POOL_SIZE = 3;

  const MOUSE_HIT_DISTANCE = 40;
  const AGE_BEFORE_DAMAGE = 1;
  const HEALTH_AMOUNT = 3;


  let health = HEALTH_AMOUNT;
  let dead = false;

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
      vy: 0,
      age: 0
    };
  });

  function updateEyeball(x, y) {
    if (dead) return;

    const rect = eyeball.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    lookAngle = Math.atan2(y - centerY, x - centerX) - Math.PI / 2;

    eyeball.style.transform = `rotate(${lookAngle}rad)`;
  }

  function shootProjectile() {
    if (dead) return;

    const rect = eyeball.getBoundingClientRect();

    const projectile = projectilePool.find(
      projectile => !projectile.active
    );

    if (!projectile) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const directionX = -Math.sin(lookAngle);
    const directionY = Math.cos(lookAngle);

    projectile.x = centerX + window.scrollX;
    projectile.y = centerY + window.scrollY;

    projectile.vx = directionX * PROJECTILE_SPEED;
    projectile.vy = directionY * PROJECTILE_SPEED;
    projectile.age = 0;

    projectile.active = true;

    projectile.element.style.display = "block";
  }

  function deactivateProjectile(projectile) {
    projectile.active = false;
    projectile.element.style.display = "none";
  }

  function damageEyeball() {
    if (dead) return;

    health--;


    eyeball.classList.remove("hit");
    // Force the animation to restart if hit repeatedly
    void eyeball.offsetWidth;
    eyeball.classList.add("hit");
    eyeball.animate(
      [
        { transform: `rotate(${lookAngle}rad) scale(1)` },
        { transform: `rotate(${lookAngle}rad) scale(1.25)` },
        { transform: `rotate(${lookAngle}rad) scale(1)` }
      ],
      {
        duration: 150,
        easing: "ease-out"
      }
    );

    if (health <= 0) {
      killEyeball();
    }
  }

  function killEyeball() {
    dead = true;

    // Stop all projectiles
    for (const projectile of projectilePool) {
      deactivateProjectile(projectile);
    }

    // Stop the damage flickers before starting death animation
    eyeball.classList.remove("hit");
    eyeball.classList.add("dying");

    setTimeout(() => {
      eyeball.style.visibility = "none";

      const respawnButton = document.createElement("button");
      respawnButton.className = "fancy-button outline eyeball-respawn";
      respawnButton.textContent = "Respawn";

      respawnButton.addEventListener("click", respawnEyeball);

      eyeball.parentElement.appendChild(respawnButton);
    }, 300);
  }

  function respawnEyeball() {
    health = HEALTH_AMOUNT;
    dead = false;

    const respawnButton =
      eyeball.parentElement.querySelector(".eyeball-respawn");

    if (respawnButton) {
      respawnButton.remove();
    }

    eyeball.classList.remove("dying");
    eyeball.style.visibility = "visible";

    // flicker
    eyeball.classList.remove("hit");
    void eyeball.offsetWidth;
    eyeball.classList.add("hit");

    updateEyeball(mouseX, mouseY);
  }

  function updateProjectiles(deltaTime) {
    for (const projectile of projectilePool) {
      if (!projectile.active) continue;

      const screenX = projectile.x - window.scrollX;
      const screenY = projectile.y - window.scrollY;
      projectile.age += deltaTime;

      // Fly to mouse homing
      const targetX = mouseX + window.scrollX;
      const targetY = mouseY + window.scrollY;

      const targetAngle = Math.atan2(
        targetY - projectile.y,
        targetX - projectile.x
      );

      const currentAngle = Math.atan2(
        projectile.vy,
        projectile.vx
      );

      let angleDifference = targetAngle - currentAngle;
      angleDifference = Math.atan2(
        Math.sin(angleDifference),
        Math.cos(angleDifference)
      );

      const maxTurn = HOMING_STRENGTH * deltaTime;

      const turn =
        Math.max(
          -maxTurn,
          Math.min(maxTurn, angleDifference)
        );

      const newAngle = currentAngle + turn;

      projectile.vx = Math.cos(newAngle) * PROJECTILE_SPEED;
      projectile.vy = Math.sin(newAngle) * PROJECTILE_SPEED;

      projectile.x += projectile.vx * deltaTime;
      projectile.y += projectile.vy * deltaTime;

      const newScreenX = projectile.x - window.scrollX;
      const newScreenY = projectile.y - window.scrollY;

      const projectileAngle = Math.atan2(
        projectile.vy,
        projectile.vx
      );

      projectile.element.style.left = `${newScreenX}px`;
      projectile.element.style.top = `${newScreenY}px`;

      projectile.element.style.transform = `
        translate(-50%, -50%)
        rotate(${projectileAngle + Math.PI / 2}rad)
      `;


      // Player hit
      if (
        Math.hypot(
          newScreenX - mouseX,
          newScreenY - mouseY
        ) < MOUSE_HIT_DISTANCE
      ) {
        document
          .querySelector(".about-page")
          ?.classList.add("screen-shake");

        setTimeout(() => {
          document
            .querySelector(".about-page")
            ?.classList.remove("screen-shake");
        }, 125);

        deactivateProjectile(projectile);
        continue;
      }


      // Collision
      const eyeballRect = eyeball.getBoundingClientRect();
      const eyeballCenterX = eyeballRect.left + eyeballRect.width / 2;
      const eyeballCenterY = eyeballRect.top + eyeballRect.height / 2;

      const eyeballRadius = eyeballRect.width / 2;

      const distance = Math.hypot(
        newScreenX - eyeballCenterX,
        newScreenY - eyeballCenterY
      );

      const projectileHitsEyeball =
        distance <= eyeballRadius;

      if (
        projectile.age > AGE_BEFORE_DAMAGE &&
        projectileHitsEyeball
      ) {
        deactivateProjectile(projectile);
        damageEyeball();
        continue;
      }

      // Out screen
      const margin = 150;

      if (
        newScreenX < -margin ||
        newScreenX > window.innerWidth + margin ||
        newScreenY < -margin ||
        newScreenY > window.innerHeight + margin
      ) {
        deactivateProjectile(projectile);
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

  // First shot + recurring shots
  shootProjectile();
  setInterval(shootProjectile, SHOOT_INTERVAL);


  // mouse
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    updateEyeball(mouseX, mouseY);
  });

  // touch
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