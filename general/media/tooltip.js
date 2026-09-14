document.querySelectorAll(".tooltip").forEach((tooltip) => {
    tooltip.addEventListener("mouseenter", () => {
        tooltip.classList.remove("tooltip-left", "tooltip-right");

        const rect = tooltip.getBoundingClientRect();
        const tooltipWidth = Math.min(280, window.innerWidth - 30);

        const tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
        const tooltipRight = tooltipLeft + tooltipWidth;

        if (tooltipLeft < 15) {
            tooltip.classList.add("tooltip-left");
        } else if (tooltipRight > window.innerWidth - 15) {
            tooltip.classList.add("tooltip-right");
        }
    });
});