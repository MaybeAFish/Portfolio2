import { audioManager } from '../../sketch.js';

export const overlayManager = {
  currentOverlay: null,

  openOverlay(id, content) {
    audioManager.playGlobalSound('/game/sounds/ui/overlay-open.mp3');
    document.body.style.cursor = 'default';

    if (document.getElementById(id)) return;

    const overlay = document.createElement('div');
    overlay.id = id;
    this.currentOverlay = overlay;

    Object.assign(overlay.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100
    });

    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'relative',
      backgroundColor: '#222',
      color: 'white',
      width: '80vw',
      maxWidth: '600px',
      height: '70vh',
      padding: '20px',
      overflowY: 'auto',
      borderRadius: '10px',
      boxShadow: '0 0 20px black'
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      fontWeight: 'bold'
    });
    closeBtn.onclick = () => overlayManager.closeOverlay(overlay);

    overlay.onclick = (e) => {
      if (e.target === overlay) overlayManager.closeOverlay(overlay);
    };

    container.appendChild(content);

    // Find and run all scripts inside content
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      // Copy attributes
      for (const attr of oldScript.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      // Copy inline script content
      newScript.text = oldScript.textContent;

      // Replace old script with new one to run it
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    container.appendChild(closeBtn);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
  },

  closeOverlay(overlay, playSound = true) {
    if (!overlay) return;

    document.body.removeChild(overlay);
    this.currentOverlay = null;

    if (playSound)
      audioManager.playGlobalSound('/game/sounds/ui/overlay-close.mp3');
  }
};