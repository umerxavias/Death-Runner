export default class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.bgmInterval = null;
    this.enabled = true;
    this.sfx = Object.create(null); // HTMLAudioElement cache
  }

  ensureContext() {
    if (!this.enabled) return;
    if (!this.audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new Ctx();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.15; // global volume
      this.masterGain.connect(this.audioCtx.destination);
    }
  }

  stopAll() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  startBGM() {
    this.ensureContext();
    if (!this.audioCtx || this.bgmInterval) return;

    // Create a more engaging ambient soundtrack
    const playAmbientLoop = () => {
      const now = this.audioCtx.currentTime;
      
      // Bass line (low frequency drone)
      const bassOsc = this.audioCtx.createOscillator();
      const bassGain = this.audioCtx.createGain();
      bassOsc.type = "sawtooth";
      bassOsc.frequency.value = 55; // Low A
      bassGain.gain.setValueAtTime(0.08, now);
      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);
      bassOsc.start(now);
      bassOsc.stop(now + 4);
      
      // Melodic layer
      const melodyOsc = this.audioCtx.createOscillator();
      const melodyGain = this.audioCtx.createGain();
      melodyOsc.type = "triangle";
      melodyOsc.frequency.value = 220; // A3
      melodyGain.gain.setValueAtTime(0.06, now);
      melodyGain.gain.exponentialRampToValueAtTime(0.01, now + 3.5);
      melodyOsc.connect(melodyGain);
      melodyGain.connect(this.masterGain);
      melodyOsc.start(now);
      melodyOsc.stop(now + 4);
      
      // Harmony layer
      const harmonyOsc = this.audioCtx.createOscillator();
      const harmonyGain = this.audioCtx.createGain();
      harmonyOsc.type = "sine";
      harmonyOsc.frequency.value = 330; // E4
      harmonyGain.gain.setValueAtTime(0.04, now);
      harmonyGain.gain.exponentialRampToValueAtTime(0.005, now + 3.8);
      harmonyOsc.connect(harmonyGain);
      harmonyGain.connect(this.masterGain);
      harmonyOsc.start(now);
      harmonyOsc.stop(now + 4);
      
      // Percussive element (soft kick)
      const kickOsc = this.audioCtx.createOscillator();
      const kickGain = this.audioCtx.createGain();
      kickOsc.type = "sine";
      kickOsc.frequency.value = 60;
      kickGain.gain.setValueAtTime(0.1, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      kickOsc.connect(kickGain);
      kickGain.connect(this.masterGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.3);
    };

    // Play initial loop
    playAmbientLoop();
    
    // Create a more complex pattern
    this.bgmInterval = setInterval(() => {
      const now = this.audioCtx.currentTime;
      
      // Randomly choose between different ambient patterns
      const patterns = [
        () => {
          // Pattern 1: Mysterious ambient
          const osc1 = this.audioCtx.createOscillator();
          const osc2 = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          
          osc1.type = "sine";
          osc2.type = "triangle";
          osc1.frequency.value = 196; // G3
          osc2.frequency.value = 294; // D4
          
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 2);
          
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.masterGain);
          
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 2);
          osc2.stop(now + 2);
        },
        () => {
          // Pattern 2: Energetic pulse
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          
          osc.type = "square";
          osc.frequency.value = 220; // A3
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 1.5);
          
          osc.connect(gain);
          gain.connect(this.masterGain);
          
          osc.start(now);
          osc.stop(now + 1.5);
        },
        () => {
          // Pattern 3: Atmospheric pad
          const osc1 = this.audioCtx.createOscillator();
          const osc2 = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          
          osc1.type = "sawtooth";
          osc2.type = "sine";
          osc1.frequency.value = 110; // A2
          osc2.frequency.value = 220; // A3
          
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.008, now + 3);
          
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.masterGain);
          
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 3);
          osc2.stop(now + 3);
        }
      ];
      
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      randomPattern();
      
    }, 2000); // Play every 2 seconds
  }

  // Preload external audio files if present in public/sounds
  preload() {
    const names = {
      hit: "/sounds/hit.mp3",
      death: "/sounds/death.mp3",
      win: "/sounds/win.mp3",
      coin: "/sounds/coin.mp3",
      jump: "/sounds/jump.mp3",
      land: "/sounds/land.mp3",
      attack: "/sounds/attack.mp3",
    };

    Object.keys(names).forEach((key) => {
      const src = names[key];
      const audio = new Audio();
      audio.src = src;
      audio.preload = "auto";
      audio.oncanplaythrough = () => {
        this.sfx[key] = audio;
      };
      audio.onerror = () => {
        // Keep fallback synth if file missing
      };
    });
  }

  playClip(name, volume = 1.0) {
    if (!this.enabled) return;
    const clip = this.sfx[name];
    if (clip) {
      try {
        const a = clip.cloneNode(true);
        a.volume = Math.min(1, Math.max(0, volume));
        a.play();
        return true;
      } catch (e) {}
    }
    return false;
  }

  playTone(frequency, duration = 0.12, type = "sine", volume = 0.4) {
    this.ensureContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playNoise(duration = 0.08, volume = 0.3) {
    this.ensureContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const bufferSize = 2 * this.audioCtx.sampleRate * duration;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = this.audioCtx.createBufferSource();
    src.buffer = buffer;
    const gain = this.audioCtx.createGain();
    gain.gain.value = volume;
    src.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
    src.stop(now + duration);
  }

  // Event wrappers
  playJump() {
    if (this.playClip("jump", 0.7)) return;
    this.playTone(660, 0.09, "sine", 0.35);
    this.playTone(880, 0.06, "sine", 0.25);
  }
  playSlide() {
    this.playNoise(0.12, 0.2);
  }
  playAttack() {
    if (this.playClip("attack", 0.6)) return;
    this.playTone(520, 0.06, "square", 0.35);
  }
  playCoin() {
    if (this.playClip("coin", 0.7)) return;
    this.playTone(1200, 0.06, "triangle", 0.4);
    this.playTone(1600, 0.06, "triangle", 0.35);
  }
  playHit() { // bullet hits player
    if (this.playClip("hit", 0.8)) return;
    this.playNoise(0.06, 0.35);
    this.playTone(180, 0.08, "sawtooth", 0.25);
  }
  playLand() {
    if (this.playClip("land", 0.6)) return;
    this.playTone(180, 0.05, "sine", 0.2);
  }
  playDeath() {
    this.stopAll();
    if (this.playClip("death", 0.9)) return;
    this.playTone(300, 0.15, "sawtooth", 0.35);
    setTimeout(() => this.playTone(220, 0.2, "sawtooth", 0.3), 120);
  }
  playWin() {
    this.stopAll();
    if (this.playClip("win", 0.9)) return;
    this.playTone(880, 0.1, "triangle", 0.3);
    setTimeout(() => this.playTone(1175, 0.12, "triangle", 0.3), 120);
    setTimeout(() => this.playTone(1568, 0.16, "triangle", 0.3), 260);
  }
}


