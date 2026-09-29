const filters = document.querySelectorAll(".skill-filter");
const cards = document.querySelectorAll(".skill-card");
const emptyState = document.querySelector(".skills-empty");

const FILTERS_KEY = "skillsFilters";
const SCROLL_KEY = "skillsScroll";
const RESTORE_KEY = "restoreSkillsState";

function applyFilters() {
    const activeFilter = [...filters]
        .find((button) => button.classList.contains("is-active"))
        ?.dataset.filter;

    const showAll = activeFilter === "all";

    let visibleCards = 0;

    cards.forEach((card) => {
        const cardSkills = card.dataset.skills.split(" ");
        const matches = showAll || cardSkills.includes(activeFilter);

        card.classList.toggle("is-hidden", !matches);

        // Highlight matching filter
        card.querySelectorAll(".skill-card-tags span").forEach((tag) => {
            const tagFilter = tag.textContent
                .toLowerCase()
                .replace(/ /g, "-");
            tag.classList.toggle(
                "is-highlighted",
                !showAll && tagFilter === activeFilter
            );
        });

        if (matches) {
            visibleCards++;
        }
    });

    emptyState.classList.toggle("is-visible", visibleCards === 0);
}

function saveSkillsState() {
    let activeFilters = [...filters]
        .filter((button) => button.classList.contains("is-active"))
        .map((button) => button.dataset.filter);

    if (activeFilters.length === 0) {
        activeFilters = ["all"];
    }

    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(activeFilters));
    sessionStorage.setItem(SCROLL_KEY, window.scrollY);
}

function restoreSkillsState() {
    if (sessionStorage.getItem(RESTORE_KEY) !== "true") {
        return;
    }

    const savedFilters = sessionStorage.getItem(FILTERS_KEY);
    const savedScroll = sessionStorage.getItem(SCROLL_KEY);

    if (savedFilters) {
        const activeFilters = JSON.parse(savedFilters);

        if (activeFilters.length === 0) {
            activeFilters = ["all"];
        }

        filters.forEach((filter) => {
            const isActive = activeFilters.includes(filter.dataset.filter);

            filter.classList.toggle("is-active", isActive);
            filter.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        applyFilters();
    }

    if (savedScroll !== null) {
        requestAnimationFrame(() => {
            window.scrollTo(0, Number(savedScroll));
        });
    }

    sessionStorage.removeItem(RESTORE_KEY);
}

filters.forEach((filter) => {
    filter.addEventListener("click", () => {
        const selectedFilter = filter.dataset.filter;

        if (selectedFilter === "all") {
            const isCurrentlyActive = filter.classList.contains("is-active");

            if (isCurrentlyActive) {
                filter.classList.remove("is-active");
                filter.setAttribute("aria-pressed", "false");
            } else {
                filters.forEach((button) => {
                    button.classList.remove("is-active");
                    button.setAttribute("aria-pressed", "false");
                });

                filter.classList.add("is-active");
                filter.setAttribute("aria-pressed", "true");
            }
        } else {
            const isCurrentlyActive = filter.classList.contains("is-active");

            if (isCurrentlyActive) {
                filters.forEach((button) => {
                    button.classList.remove("is-active");
                    button.setAttribute("aria-pressed", "false");
                });

                const allFilter = document.querySelector(
                    '.skill-filter[data-filter="all"]'
                );

                allFilter.classList.add("is-active");
                allFilter.setAttribute("aria-pressed", "true");
            } else {
                filters.forEach((button) => {
                    button.classList.remove("is-active");
                    button.setAttribute("aria-pressed", "false");
                });

                filter.classList.add("is-active");
                filter.setAttribute("aria-pressed", "true");
            }
        }

        applyFilters();
        saveSkillsState();
    });
});

// Keep the latest scroll position available.
let scrollSavePending = false;

window.addEventListener("scroll", () => {
    if (scrollSavePending) {
        return;
    }

    scrollSavePending = true;

    requestAnimationFrame(() => {
        sessionStorage.setItem(SCROLL_KEY, window.scrollY);
        scrollSavePending = false;
    });
});

restoreSkillsState();