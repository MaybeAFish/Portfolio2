const sections = document.querySelectorAll("[data-section]");

sections.forEach(async (slot) => {
  const sectionName = slot.dataset.section;
  const response = await fetch(`/about/${sectionName}/${sectionName}.html`);

  if (response.ok) {
    slot.innerHTML = await response.text();
  }

  if (sectionName === "fav_games") {
    initialiseGameCharacters();
  }
});

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