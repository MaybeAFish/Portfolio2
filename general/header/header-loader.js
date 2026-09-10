document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("header-placeholder");
  if (!placeholder) return;

  const response = await fetch("/general/header/header.html");
  placeholder.innerHTML = await response.text();

  const normalizePath = path => path.replace(/\/$/, "") || "/";
  const currentPath = normalizePath(window.location.pathname);
  const isAllProjectsSelected = currentPath === "/" || currentPath === "/projects";

  const trigger = placeholder.querySelector(".projects-nav-trigger");
  if (trigger) {
    trigger.textContent = "Projects";
    trigger.setAttribute("aria-label", "Projects");

    if (isAllProjectsSelected) {
      trigger.classList.add("active");
    }
  }

  const dropdownLinks = placeholder.querySelectorAll(".dropdown-content a");
  dropdownLinks.forEach(link => {
    const linkPath = normalizePath(new URL(link.href).pathname);
    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });

  placeholder.querySelectorAll("nav a").forEach(link => {
    const linkPath = normalizePath(new URL(link.href).pathname);
    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });
});
