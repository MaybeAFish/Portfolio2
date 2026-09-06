document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("footer-placeholder");
  if (!placeholder) return;

  const response = await fetch("/general/footer/footer.html");
  placeholder.outerHTML = await response.text();
});