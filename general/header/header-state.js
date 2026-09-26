const normalizePath = path => path.replace(/\/$/, "") || "/";
const currentPath = normalizePath(window.location.pathname);

const isAllProjectsSelected =
  currentPath === "/" || currentPath === "/projects";

const trigger = document.querySelector(".projects-nav-trigger");

if (trigger) {
  trigger.textContent = "Projects";
  trigger.setAttribute("aria-label", "Projects");

  if (isAllProjectsSelected) {
    trigger.classList.add("active");
  } else if (currentPath.startsWith("/projects/")) {
    trigger.classList.add("subpage");
  }
}

document.querySelectorAll(".dropdown-content a").forEach(link => {
  const linkPath = normalizePath(new URL(link.href).pathname);

  if (linkPath === currentPath) {
    link.classList.add("active");
  } else if (
    linkPath !== "/" &&
    currentPath.startsWith(linkPath + "/")
  ) {
    link.classList.add("active");
  }
});

document.querySelectorAll("nav a").forEach(link => {
  const linkPath = normalizePath(new URL(link.href).pathname);

  if (linkPath === currentPath) {
    link.classList.add("active");
  } else if (
    linkPath !== "/" &&
    currentPath.startsWith(linkPath + "/")
  ) {
    link.classList.add("subpage");
  }
});

// Enable animations only after the initial state is set
document.documentElement.classList.remove("no-header-transition");