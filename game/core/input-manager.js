export class InputManager {
  constructor() {
    this.keysHeld = {};
    this.keysPressed = {};
    this.mouseButtons = { left: false, middle: false, right: false };
    
    this.mouseDelta = { x: 0, y: 0 };
    this.mousePosition = { x: 0, y: 0 };

    // Default controls
    this.lookSensitivity = 0.002;
    this.bindings = {
      forward: 'w',
      backward: 's',
      left: 'a',
      right: 'd',

      jump: ' ',
      interact: 'e',
      map: 'm',
      settings: 'p',
      fullscreen: 'f',
    };

    this._setupListeners();
  }

  _setupListeners() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (!this.keysHeld[key]) this.keysPressed[key] = true;
      this.keysHeld[key] = true;
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keysHeld[key] = false;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseButtons.left = true;
      if (e.button === 1) this.mouseButtons.middle = true;
      if (e.button === 2) this.mouseButtons.right = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseButtons.left = false;
      if (e.button === 1) this.mouseButtons.middle = false;
      if (e.button === 2) this.mouseButtons.right = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseDelta.x = e.movementX;
      this.mouseDelta.y = e.movementY;
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });

    // window.addEventListener('click', (e) => {
    //   if (!currentCharacter?.handleClickRaycast) return;
    //   currentCharacter.handleClickRaycast(e, scene, camera);
    // });
  

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  resetFrame() {
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    for (const key in this.keysPressed) {
      this.keysPressed[key] = false;
    }
  }
}

export const inputManager = new InputManager();