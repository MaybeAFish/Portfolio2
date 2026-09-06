function loadPDF(button, pdfUrl) {
  const container = document.createElement('div');
  container.className = 'pdf-container';
  container.innerHTML = `<iframe src="${pdfUrl}"></iframe>`;
  button.replaceWith(container);
}