const filters = document.querySelectorAll(".skill-filter");
const cards = document.querySelectorAll(".skill-card");
const emptyState = document.querySelector(".skills-empty");

filters.forEach((filter) => {
    filter.addEventListener("click", () => {
        const selectedFilter = filter.dataset.filter;

        if (selectedFilter === "all") {
            filters.forEach((button) => {
                button.classList.remove("is-active");
                button.setAttribute("aria-pressed", "false");
            });

            filter.classList.add("is-active");
            filter.setAttribute("aria-pressed", "true");
        } else {
            const allFilter = document.querySelector('.skill-filter[data-filter="all"]');

            allFilter.classList.remove("is-active");
            allFilter.setAttribute("aria-pressed", "false");

            filter.classList.toggle("is-active");

            filter.setAttribute(
                "aria-pressed",
                filter.classList.contains("is-active") ? "true" : "false"
            );

            const activeSpecificFilters = [...filters].filter(
                (button) =>
                    button.dataset.filter !== "all" &&
                    button.classList.contains("is-active")
            );

            if (activeSpecificFilters.length === 0) {
                allFilter.classList.add("is-active");
                allFilter.setAttribute("aria-pressed", "true");
            }
        }

        const activeFilters = [...filters]
            .filter((button) => button.classList.contains("is-active"))
            .map((button) => button.dataset.filter);

        const showAll = activeFilters.includes("all");

        let visibleCards = 0;

        cards.forEach((card) => {
            const cardSkills = card.dataset.skills.split(" ");

            const matches =
                showAll ||
                activeFilters.some((filterName) =>
                    cardSkills.includes(filterName)
                );

            card.classList.toggle("is-hidden", !matches);

            if (matches) {
                visibleCards++;
            }
        });

        emptyState.classList.toggle("is-visible", visibleCards === 0);
    });
});