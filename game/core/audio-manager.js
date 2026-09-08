export class AudioManager {
  constructor(camera) {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.listener = this.audioContext.listener;
    this.camera = camera;

    // Create gain nodes
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();

    // Set default values
    this.masterGain.gain.value = 0.8;
    this.musicGain.gain.value = 1.0;
    this.sfxGain.gain.value = 1.0;

    // Chain: music/sfx -> master -> destination
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    this.updateListener();
  }

  updateListener() {
    const pos = this.camera.position;
    this.listener.setPosition(pos.x, pos.y, pos.z);
  }

  // Global sound
  playGlobalSound(url, volume = 1.0, category = 'sfx') {
    this._loadAndPlay(url, volume, null, 50, category);
  }

  // Positional sound
  playPositionalSound(url, position, maxDistance = 50, category = 'sfx') {
    this._loadAndPlay(url, 1.0, position, maxDistance, category);
  }

  async _loadAndPlay(url, volume, position = null, maxDistance = 50, category = 'sfx') {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    let finalNode;

    if (position) {
      const panner = this.audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'linear';
      panner.maxDistance = maxDistance;
      panner.refDistance = 1;
      panner.rolloffFactor = 1;
      panner.setPosition(position.x, position.y, position.z);
      source.connect(panner);
      finalNode = panner;
    } else {
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume;
      source.connect(gainNode);
      finalNode = gainNode;
    }

    // Route through proper gain group
    const targetGain = category === 'music' ? this.musicGain : this.sfxGain;
    finalNode.connect(targetGain);

    source.start();
  }
}
