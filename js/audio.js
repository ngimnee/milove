/* --------------------------------------------------------------------------
   AUDIO ENGINE - HYBRID HTML5 & WEB AUDIO SYNTHESIZER
   -------------------------------------------------------------------------- */

const AudioEngine = (function() {
  'use strict';

  // Sound file mappings (relative paths)
  const SOUND_PATHS = {
    background: [
      './sounds/don-gian-anh-yeu-em.mp3',
      './sounds/background.mp3'
    ]
  };

  let audioContext = null;
  let bgAudio = null;
  let isMuted = false;
  let isUnlocked = false;

  // Initialize Web Audio API Context (ONLY after user gesture unlock)
  function getAudioContext() {
    if (!isUnlocked) return null;
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

  function init() {
    bgAudio = new Audio();
    bgAudio.loop = true;
    bgAudio.volume = 0.5;
    bgAudio.src = SOUND_PATHS.background[0];

    // Delegate click listener for audio widget / button anywhere in DOM
    document.addEventListener('click', (e) => {
      const audioBtn = e.target.closest('#audio-widget-btn, #audio-widget, #dock-audio-item');
      if (audioBtn) {
        e.stopPropagation();
        toggleMute();
      }
    });

    // Listen for first user interaction to unlock audio
    const unlockHandler = () => {
      unlockAudio();
      document.removeEventListener('click', unlockHandler);
      document.removeEventListener('touchstart', unlockHandler);
      document.removeEventListener('keydown', unlockHandler);
      document.removeEventListener('pointerdown', unlockHandler);
    };
    document.addEventListener('click', unlockHandler);
    document.addEventListener('touchstart', unlockHandler);
    document.addEventListener('keydown', unlockHandler);
    document.addEventListener('pointerdown', unlockHandler);
  }

  // One-time AudioContext initialization on first user gesture
  function unlockAudio() {
    if (isUnlocked) return;
    isUnlocked = true;
    getAudioContext();
    bgPlay();
  }

  // Start / resume background music
  function bgPlay() {
    if (!bgAudio || isMuted || !isUnlocked) return;
    bgAudio.play().then(() => {
      updateUIState(true);
    }).catch(err => {
      console.log('Autoplay blocked, synth mode:', err);
    });
  }

  // Play Sound Effects (only after user has unlocked audio)
  function playSound(type) {
    if (isMuted || !isUnlocked) return;
    synthesizeSoundEffect(type);
  }

  // Web Audio API Sound Effect Generators
  function synthesizeSoundEffect(type) {
    if (!isUnlocked) return;
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
    } else if (type === 'page') {
      // Resume context explicitly (may be suspended between interactions)
      if (ctx.state === 'suspended') ctx.resume();

      // Paper-rustle: shaped noise, 180ms, louder so it cuts through background music
      const bufferSize = Math.floor(ctx.sampleRate * 0.18);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Smooth bell-curve envelope peaking at 20% into buffer
        const t = i / bufferSize;
        const env = Math.pow(Math.sin(Math.PI * t), 0.5) * (1 - t * 0.4);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Single gentle low-pass (less attenuation than bandpass chain)
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2400;
      lp.Q.value = 0.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(lp);
      lp.connect(gain);
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
      } else {
        if (!isUnlocked) {
          unlockAudio();
        } else {
          bgPlay();
        }
      }
    }
    updateUIState(!isMuted);
    return isMuted;
  }

  let originalVolume = 0.5;
  let volumeFadeTimer = null;

  function fadeVolume(targetRatio = 0.4, durationMs = 1500) {
    if (!bgAudio) return;
    if (volumeFadeTimer) clearInterval(volumeFadeTimer);
    const startVol = bgAudio.volume;
    const targetVol = originalVolume * targetRatio;
    const steps = 30;
    const interval = durationMs / steps;
    let stepCount = 0;

    volumeFadeTimer = setInterval(() => {
      stepCount++;
      const progress = stepCount / steps;
      bgAudio.volume = Math.max(0.05, startVol + (targetVol - startVol) * progress);
      if (stepCount >= steps) {
        clearInterval(volumeFadeTimer);
        volumeFadeTimer = null;
      }
    }, interval);
  }

  function restoreVolume(durationMs = 1500) {
    if (!bgAudio) return;
    if (volumeFadeTimer) clearInterval(volumeFadeTimer);
    const startVol = bgAudio.volume;
    const targetVol = originalVolume;
    const steps = 30;
    const interval = durationMs / steps;
    let stepCount = 0;

    volumeFadeTimer = setInterval(() => {
      stepCount++;
      const progress = stepCount / steps;
      bgAudio.volume = Math.min(originalVolume, startVol + (targetVol - startVol) * progress);
      if (stepCount >= steps) {
        clearInterval(volumeFadeTimer);
        volumeFadeTimer = null;
      }
    }, interval);
  }

  function updateUIState(playing) {
    const widgets = [
      document.getElementById('audio-widget'),
      document.getElementById('dock-audio-item'),
      document.getElementById('audio-widget-btn')
    ].filter(Boolean);

    const icons = [
      document.getElementById('audio-icon'),
      ...document.querySelectorAll('.dock-item-audio i')
    ].filter(Boolean);

    widgets.forEach(w => {
      if (playing) {
        w.classList.remove('audio-paused');
      } else {
        w.classList.add('audio-paused');
      }
    });

    icons.forEach(icon => {
      icon.className = playing ? 'fas fa-music' : 'fas fa-volume-mute';
    });
  }

  return {
    init,
    unlockAudio,
    playSound,
    toggleMute,
    fadeVolume,
    restoreVolume
  };
})();
