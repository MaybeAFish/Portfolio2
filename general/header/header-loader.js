document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("header-placeholder");
  if (!placeholder) return;

  const response = await fetch("/general/header/header.html");
  placeholder.innerHTML = await response.text();

  const normalizePath = path => path.replace(/\/$/, "") || "/";
  const currentPath = normalizePath(window.location.pathname);
  const projectOptions = [
    { path: "/", label: "Projects" },
    { path: "/projects/tetris", label: "Tetris" },
    { path: "/projects/engine", label: "Engine" },
    { path: "/projects/doomed", label: "Doomed" }
  ];

  const activeProject = projectOptions.find(option => currentPath === option.path) ||
    projectOptions.find(option => currentPath.startsWith(option.path + "/")) ||
    projectOptions[0];

  const trigger = placeholder.querySelector(".projects-nav-trigger");
  const projectLinks = placeholder.querySelectorAll(".dropdown-content a");

  if (trigger) {
    trigger.textContent = activeProject.label;
    trigger.setAttribute("aria-label", `Projects: ${activeProject.label}`);
    if (activeProject.path !== "/projects/") {
      trigger.classList.add("active");
    }
  }

  projectLinks.forEach(link => {
    const linkPath = normalizePath(new URL(link.href).pathname);
    if (linkPath === activeProject.path) {
      link.classList.add("active");
    }
    if (activeProject.path === "/projects/" && linkPath === "/projects/") {
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
