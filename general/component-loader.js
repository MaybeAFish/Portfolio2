document.querySelectorAll("[data-component]").forEach(async (element) => {
  const response = await fetch(element.dataset.component);
  element.innerHTML = await response.text();

  const currentPath = window.location.pathname;

  element.querySelectorAll("a").forEach(link => {
    if (link.pathname === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
});