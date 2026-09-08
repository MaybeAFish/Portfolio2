// loading-helper.js
export class LoadingProgress {
  constructor(updateFn) {
    this.updateFn = updateFn; // function(percent, label)
    this.steps = [];
  }

  showLoadingScreen(label = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const loadingBar = document.getElementById('loading-bar');

    overlay.style.display = 'flex';
    loadingText.textContent = label;
    loadingBar.style.width = '0%';
  }

  updateLoadingScreen(label, percent) {
    const loadingText = document.getElementById('loading-text');
    const loadingBar = document.getElementById('loading-bar');

    loadingText.textContent = label;
    loadingBar.style.width = `${percent}%`;
  }

  hideLoadingScreen() {
    document.getElementById('loading-overlay').style.display = 'none';
  }

  

  addStep(label, weight) {
    const step = { label, weight, completed: false };
    this.steps.push(step);
    return step;
  }

  update(label, fraction) {
    let totalWeight = 0;
    let completedWeight = 0;

    for (const step of this.steps) {
      if (step.label === label) {
        completedWeight += step.weight * fraction;
      } else if (step.completed) {
        completedWeight += step.weight;
      }
      totalWeight += step.weight;
    }

    const percent = (completedWeight / totalWeight) * 100;
    this.updateFn(label, percent);
  }

  markDone(label) {
    const step = this.steps.find(s => s.label === label);
    if (step) step.completed = true;
    this.update(label, 1);
  }
}