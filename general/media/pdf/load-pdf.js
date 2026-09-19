function loadPDF(button, pdfUrl) {
  if (window.innerWidth <= 768) {
    window.open(pdfUrl, "_blank");
    return;
  }

  const container = document.createElement("div");
  container.className = "pdf-container";
  container.innerHTML = `<iframe src="${pdfUrl}"></iframe>`;
  button.replaceWith(container);
}