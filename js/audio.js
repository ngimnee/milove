/* ==========================================================================
   AUDIO ENGINE - HYBRID HTML5 & WEB AUDIO SYNTHESIZER
   ========================================================================== */

const AudioEngine = (function() {
  'use strict';

  // Sound file mappings (relative paths)
  const SOUND_PATHS = {
    background: ['./sounds/background.mp3', './sounds/don-gian-anh-yeu-em.mp3'],
    typing: ['./sounds/typing.mp3'],
    click: ['./sounds/click.mp3'],
    open: ['./sounds/open.mp3'],
    fireworks: ['./sounds/fireworks.mp3'],
    ending: ['./sounds/ending.mp3']
  };

  let audioContext = null;
  let bgAudio = null;
  let isMuted = false;
  let isUnlocked = false;
  const audioCache = {};

  // Initialize Web Audio API Context
  function getAudioContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  // Preload sound files with fallback synthesizer
  function init() {
    // Setup Background HTML5 Audio
    bgAudio = new Audio();
    bgAudio.loop = true;
    bgAudio.volume = 0.5;

    // Try primary background track, fallback to secondary
    let bgIndex = 0;
    function tryLoadBg() {
      if (bgIndex < SOUND_PATHS.background.length) {
        bgAudio.src = SOUND_PATHS.background[bgIndex];
        bgAudio.onerror = () => {
          bgIndex++;
          tryLoadBg();
        };
      }
    }
    tryLoadBg();

    // Listen for first user interaction to unlock audio
    const unlockHandler = () => {
      unlockAudio();
      document.removeEventListener('click', unlockHandler);
      document.removeEventListener('touchstart', unlockHandler);
      document.removeEventListener('keydown', unlockHandler);
    };
    document.addEventListener('click', unlockHandler);
    document.addEventListener('touchstart', unlockHandler);
    document.addEventListener('keydown', unlockHandler);
  }

  // One-time AudioContext initialization (called on first gesture)
  function unlockAudio() {
    if (isUnlocked) return;
    isUnlocked = true;
    getAudioContext();
    bgPlay();
  }

  // Start / resume background music (can be called multiple times)
  function bgPlay() {
    if (!bgAudio || isMuted) return;
    bgAudio.play().then(() => {
      updateUIState(true);
    }).catch(err => {
      console.log('Audio autoplay blocked, falling back to synth:', err);
      startSynthesizedAmbient();
    });
  }

  // Synthesize ambient romantic chord progression if MP3 audio fails
  let synthInterval = null;
  function startSynthesizedAmbient() {
    if (synthInterval || isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];
    let chordIdx = 0;

    function playChordStep() {
      if (isMuted) return;
      const now = ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 1.0);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + 4.5);
      });
    }

    playChordStep();
    synthInterval = setInterval(playChordStep, 4000);
  }

  // Play Sound Effects with Fallback Synth Generators
  function playSound(type) {
    if (isMuted) return;
    unlockAudio();

    // Check if HTML5 audio path works
    const pathList = SOUND_PATHS[type];
    if (pathList && pathList.length > 0) {
      const sfx = new Audio(pathList[0]);
      sfx.volume = type === 'typing' ? 0.25 : 0.6;
      sfx.play().catch(() => {
        synthesizeSoundEffect(type);
      });
    } else {
      synthesizeSoundEffect(type);
    }
  }

  // Web Audio API Sound Effect Generators
  function synthesizeSoundEffect(type) {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'typing') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'open') {
      // Warm harp sparkle
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } else if (type === 'fireworks') {
      // Crackle noise burst
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    }
  }

  // Toggle Mute / Play
  function toggleMute() {
    isMuted = !isMuted;
    if (bgAudio) {
      if (isMuted) {
        bgAudio.pause();
        if (synthInterval) {
          clearInterval(synthInterval);
          synthInterval = null;
        }
      } else {
        // Resume: call bgPlay directly (not unlockAudio which is guarded)
        bgPlay();
      }
    }
    updateUIState(!isMuted);
    return isMuted;
  }

  function updateUIState(playing) {
    const widget = document.getElementById('audio-widget');
    const icon = document.getElementById('audio-icon');
    if (widget && icon) {
      if (playing) {
        widget.classList.remove('audio-paused');
        icon.className = 'fas fa-volume-up';
      } else {
        widget.classList.add('audio-paused');
        icon.className = 'fas fa-volume-mute';
      }
    }
  }

  return {
    init,
    unlockAudio,
    playSound,
    toggleMute
  };
})();
