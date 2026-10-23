const initializeTooltips = () => {
    const tooltips = document.querySelectorAll(".tooltip");
    const floatingTooltip = document.createElement("div");
    const originalDescriptions = new WeakMap();
    let activeTooltip = null;
    let isPinned = false;
    let positionFrame = null;

    floatingTooltip.className = "tooltip-popover";
    floatingTooltip.id = "site-tooltip";
    floatingTooltip.setAttribute("role", "tooltip");

    const positionTooltip = () => {
        if (!activeTooltip) return;

        const anchor = activeTooltip.getBoundingClientRect();
        const tooltip = floatingTooltip.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight;
        const margin = 15;
        const gap = 10;
        const maxLeft = Math.max(margin, viewportWidth - tooltip.width - margin);
        const left = Math.min(
            Math.max(anchor.left + anchor.width / 2 - tooltip.width / 2, margin),
            maxLeft
        );
        const below = anchor.bottom + gap;
        const top = below + tooltip.height <= viewportHeight - margin
            ? below
            : anchor.top - tooltip.height - gap;

        floatingTooltip.style.left = `${left}px`;
        floatingTooltip.style.top = `${Math.min(
            Math.max(top, margin),
            Math.max(margin, viewportHeight - tooltip.height - margin)
        )}px`;
    };

    const restoreDescription = (element) => {
        const description = originalDescriptions.get(element);
        if (description === null) {
            element.removeAttribute("aria-describedby");
        } else {
            element.setAttribute("aria-describedby", description);
        }
    };

    const hideTooltip = () => {
        if (!activeTooltip) return;

        restoreDescription(activeTooltip);
        activeTooltip.classList.remove("tooltip-open");
        activeTooltip = null;
        isPinned = false;
        floatingTooltip.classList.remove("is-visible");
    };

    const showTooltip = (element, pinned = false) => {
        if (activeTooltip && activeTooltip !== element) {
            restoreDescription(activeTooltip);
            activeTooltip.classList.remove("tooltip-open");
        }

        activeTooltip = element;
        isPinned = pinned;
        if (!originalDescriptions.has(element)) {
            originalDescriptions.set(element, element.getAttribute("aria-describedby"));
        }

        floatingTooltip.textContent = element.dataset.tooltip;
        if (!floatingTooltip.isConnected) document.body.append(floatingTooltip);
        element.setAttribute("aria-describedby", floatingTooltip.id);
        floatingTooltip.classList.add("is-visible");
        positionTooltip();
    };

    const schedulePosition = () => {
        if (positionFrame !== null) cancelAnimationFrame(positionFrame);
        positionFrame = requestAnimationFrame(() => {
            positionFrame = null;
            positionTooltip();
        });
    };

    tooltips.forEach((tooltip) => {
        tooltip.addEventListener("pointerenter", (event) => {
            if (event.pointerType !== "touch" && !tooltip.classList.contains("tooltip-open")) {
                showTooltip(tooltip);
            }
        });

        tooltip.addEventListener("pointerleave", () => {
            if (activeTooltip === tooltip && !isPinned) hideTooltip();
        });

        tooltip.addEventListener("touchstart", (event) => {
            event.stopPropagation();
            if (activeTooltip === tooltip && isPinned) {
                hideTooltip();
                return;
            }

            tooltip.classList.add("tooltip-open");
            showTooltip(tooltip, true);
        }, { passive: true });
    });

    document.addEventListener("touchstart", (event) => {
        if (!event.target.closest(".tooltip")) hideTooltip();
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") hideTooltip();
    });

    window.addEventListener("resize", schedulePosition);
    window.addEventListener("scroll", schedulePosition, true);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeTooltips, { once: true });
} else {
    initializeTooltips();
}
