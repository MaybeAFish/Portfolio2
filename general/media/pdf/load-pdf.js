function loadPDF(button, pdfUrl) {
  if (window.innerWidth <= 768) {
    window.open(pdfUrl, "_blank");
    return;
  }

  const container = document.createElement("div");
  container.className = "pdf-container";
  container.innerHTML = `<iframe src="${pdfUrl}"></iframe>`;

  container.addEventListener("mouseenter", () => {
    document.documentElement.classList.add("game-hovered");
  });

  container.addEventListener("mouseleave", () => {
    document.documentElement.classList.remove("game-hovered");
  });

  button.replaceWith(container);
}