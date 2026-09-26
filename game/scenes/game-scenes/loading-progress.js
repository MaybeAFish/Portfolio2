export class LoadingProgress {
  constructor() {
    this.steps = [];
  }

  showLoadingScreen() {
    const overlay = document.getElementById('loading-overlay');

    overlay.style.display = 'flex';

    this.render();
    this.updateBar(0);
  }

  addStep(label, weight = 1) {
    const step = {
      label,
      weight,
      progress: 0,
      completed: false
    };

    this.steps.push(step);
    this.render();

    return step;
  }

  update(label, fraction, displayLabel = label) {
    const step = this.steps.find(s => s.label === label);
    if (!step) return;

    step.displayLabel = displayLabel;
    step.progress = Math.max(0, Math.min(1, fraction));

    if (step.progress >= 1) {
      step.completed = true;
    }

    this.render();
    this.updateBar(this.getPercent());
  }

  markDone(label) {
    const step = this.steps.find(s => s.label === label);

    if (!step) return;

    step.progress = 1;
    step.completed = true;

    this.render();
    this.updateBar(this.getPercent());
  }

  getPercent() {
    const totalWeight = this.steps.reduce(
      (sum, step) => sum + step.weight,
      0
    );

    const completedWeight = this.steps.reduce(
      (sum, step) => sum + step.weight * step.progress,
      0
    );

    if (totalWeight === 0) return 0;

    return (completedWeight / totalWeight) * 100;
  }

  render() {
    const container = document.getElementById('loading-steps');
    if (!container) return;

    container.innerHTML = '';

    this.steps.forEach(step => {
      const element = document.createElement('div');

      element.classList.add('loading-step');

      if (step.completed) {
        element.classList.add('completed');
      } else if (step.progress > 0) {
        element.classList.add('loading');
      } else {
        element.classList.add('pending');
      }

      let icon = '○';

      if (step.completed) {
        icon = '✓';
      } else if (step.progress > 0) {
        icon = '◌';
      }

      element.innerHTML = `
        <span class="loading-step-icon">${icon}</span>
        <span class="loading-step-label">${step.displayLabel || step.label}</span>
      `;

      container.appendChild(element);
    });
  }

  updateBar(percent) {
    const loadingBar = document.getElementById('loading-bar');

    if (loadingBar) {
      loadingBar.style.width = `${percent}%`;
    }
  }

  hideLoadingScreen() {
    document.getElementById('loading-overlay').style.display = 'none';
  }
}