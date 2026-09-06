document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("header-placeholder");
  if (!placeholder) return;

  const response = await fetch("/general/header/header.html");
  placeholder.innerHTML = await response.text();

  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  placeholder.querySelectorAll("nav a").forEach(link => {
    const linkPath = new URL(link.href).pathname.replace(/\/$/, "") || "/";
    if (linkPath === currentPath) link.classList.add("active");
  });
});
