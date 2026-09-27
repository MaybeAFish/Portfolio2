// Tooltip is weird for <h2> elemetns
document.querySelectorAll(".tooltip").forEach((tooltip) => {
    // existing desktop positioning logic
    tooltip.addEventListener("mouseenter", () => {
        tooltip.classList.remove("tooltip-left", "tooltip-right");
        const rect = tooltip.getBoundingClientRect();
        const tooltipWidth = Math.min(280, window.innerWidth - 30);
        const tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
        const tooltipRight = tooltipLeft + tooltipWidth;
        if (tooltipLeft < 15) tooltip.classList.add("tooltip-left");
        else if (tooltipRight > window.innerWidth - 15) tooltip.classList.add("tooltip-right");
    });

    // mobile: toggle on tap instead of relying on :active
    tooltip.addEventListener("touchstart", (e) => {
        e.stopPropagation();
        const isOpen = tooltip.classList.contains("tooltip-open");

        // close any other open tooltips first
        document.querySelectorAll(".tooltip.tooltip-open").forEach(t => {
            if (t !== tooltip) t.classList.remove("tooltip-open");
        });

        // reposition, same logic as mouseenter
        tooltip.classList.remove("tooltip-left", "tooltip-right");
        const rect = tooltip.getBoundingClientRect();
        const tooltipWidth = Math.min(280, window.innerWidth - 30);
        const tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
        const tooltipRight = tooltipLeft + tooltipWidth;
        if (tooltipLeft < 15) tooltip.classList.add("tooltip-left");
        else if (tooltipRight > window.innerWidth - 15) tooltip.classList.add("tooltip-right");

        tooltip.classList.toggle("tooltip-open", !isOpen);
    }, { passive: true });
});

// tap anywhere else closes open tooltips
document.addEventListener("touchstart", (e) => {
    if (!e.target.closest(".tooltip")) {
        document.querySelectorAll(".tooltip.tooltip-open").forEach(t => t.classList.remove("tooltip-open"));
    }
}, { passive: true });
