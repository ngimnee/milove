/* --------------------------------------------------------------------------
   AUDIO ENGINE - HYBRID HTML5 & WEB AUDIO SYNTHESIZER
   -------------------------------------------------------------------------- */

const AudioEngine = (function() {
  'use strict';

  // Anything matching this toggles mute; extra toggles can opt in with data-audio-toggle
  const AUDIO_TOGGLE_SELECTOR = '#audio-widget-btn, #audio-widget, #dock-audio-item, [data-audio-toggle]';
  const UNLOCK_EVENTS = ['click', 'touchstart', 'keydown', 'pointerdown'];

  const BACKGROUND_TRACK = { src: './sounds/don-gian-anh-yeu-em.mp3', volume: 0.5 };
  const SPECIAL_DEFAULT_VOLUME = 0.6;
  const TRACK_FADE_OUT_MS = 1200;
  const TRACK_FADE_IN_MS = 1500;
  const FADE_STEPS = 30;
  const RECENT_EFFECT_MS = 150;

  // Lifecycle of a special-day track temporarily replacing the background track
  const MUSIC_STATE = Object.freeze({
    NORMAL: 'normal',
    SPECIAL_ENTER: 'special-enter',
    SPECIAL_PLAYING: 'special-playing',
    SPECIAL_EXIT: 'special-exit'
  });

  let audioContext = null;
  // One element plays whichever track is current: two songs can never overlap, and iOS/Safari
  // keep treating it as user-activated after its src changes.
  let music = null;
  let currentTrack = BACKGROUND_TRACK;
  let backgroundResumeTime = 0;
  let musicState = MUSIC_STATE.NORMAL;
  let transitionId = 0;
  let fadeTimer = null;
  let settleFade = null;
  let fadeInOnPlay = false; // a track was switched while audio was still locked
  let isMuted = false;
  let isUnlocked = false;
  let isUnlockArmed = false;
  let lastEffectAt = -Infinity;

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
    music = new Audio();
    music.loop = true;
    music.volume = BACKGROUND_TRACK.volume;
    music.src = BACKGROUND_TRACK.src;
    music.addEventListener('error', onMusicError);

    // Delegate click listener for audio widget / button anywhere in DOM
    document.addEventListener('click', (e) => {
      const audioBtn = e.target.closest && e.target.closest(AUDIO_TOGGLE_SELECTOR);
      if (audioBtn) {
        e.stopPropagation();
        if (isUnlocked) {
          toggleMute();
        } else {
          unlockAudio();
        }
      }
    });

    armUnlock();
  }

  // Wait for the next user gesture before audio may start
  function armUnlock() {
    if (isUnlockArmed) return;
    isUnlockArmed = true;
    UNLOCK_EVENTS.forEach(type => document.addEventListener(type, onUnlockGesture));
  }

  function disarmUnlock() {
    if (!isUnlockArmed) return;
    isUnlockArmed = false;
    UNLOCK_EVENTS.forEach(type => document.removeEventListener(type, onUnlockGesture));
  }

  function onUnlockGesture(e) {
    // The audio toggle's own click handles unlocking; otherwise its pointerdown would start
    // the music and the click that follows would immediately mute it again.
    if (e.target.closest && e.target.closest(AUDIO_TOGGLE_SELECTOR)) return;
    unlockAudio();
  }

  // One-time AudioContext initialization on first user gesture
  function unlockAudio() {
    disarmUnlock();
    if (isUnlocked) return;
    isUnlocked = true;
    getAudioContext();
    playCurrentTrack();
  }

  // Start / resume whichever track is current (background or special)
  function playCurrentTrack() {
    if (!music || isMuted || !isUnlocked) return Promise.resolve(false);
    return music.play().then(() => {
      updateUIState(true);
      if (fadeInOnPlay) {
        fadeInOnPlay = false;
        fadeTo(currentTrack.volume, TRACK_FADE_IN_MS);
      }
      return true;
    }).catch(err => {
      console.log('Autoplay blocked, synth mode:', err);
      if (err && err.name === 'NotAllowedError') {
        // Browser still wants a gesture: retry on the next one through the normal unlock path
        isUnlocked = false;
        armUnlock();
      }
      return false;
    });
  }

  function isAudible() {
    return Boolean(music) && !music.paused;
  }

  function onMusicError() {
    if (currentTrack === BACKGROUND_TRACK) return;
    console.warn('[AudioEngine] Special music could not be loaded, restoring background music:', currentTrack.src);
    stopSpecialMusic();
  }

  // Play Sound Effects (only after user has unlocked audio)
  // options.unlessRecent: skip it if another sound just played (the page-wide click sound
  // must not double up with the sound a button already plays for the same click)
  function playSound(type, options = {}) {
    if (isMuted || !isUnlocked) return;
    const now = performance.now();
    if (options.unlessRecent && now - lastEffectAt < RECENT_EFFECT_MS) return;
    // Typing ticks come every few dozen ms and are not a click's sound: they do not count
    if (type !== 'typing') lastEffectAt = now;
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
    if (music) {
      if (isMuted) {
        music.pause();
      } else {
        if (!isUnlocked) {
          unlockAudio();
        } else {
          playCurrentTrack();
        }
      }
    }
    updateUIState(!isMuted);
    return isMuted;
  }

  // ── Volume fades ───────────────────────────────────────────────────────
  // A new fade cancels the running one; the cancelled promise still resolves so
  // callers can check whether their transition is still current.

  function fadeTo(targetVolume, durationMs) {
    cancelFade();
    if (!music) return Promise.resolve();

    const startVolume = music.volume;
    let step = 0;
    return new Promise(resolve => {
      settleFade = resolve;
      fadeTimer = setInterval(() => {
        step++;
        const volume = startVolume + (targetVolume - startVolume) * (step / FADE_STEPS);
        music.volume = Math.min(1, Math.max(0, volume));
        if (step >= FADE_STEPS) cancelFade();
      }, durationMs / FADE_STEPS);
    });
  }

  function cancelFade() {
    clearInterval(fadeTimer);
    fadeTimer = null;
    if (settleFade) {
      const resolve = settleFade;
      settleFade = null;
      resolve();
    }
  }

  function fadeVolume(targetRatio = 0.4, durationMs = 1500) {
    return fadeTo(currentTrack.volume * targetRatio, durationMs);
  }

  function restoreVolume(durationMs = 1500) {
    return fadeTo(currentTrack.volume, durationMs);
  }

  // ── Special-day music ──────────────────────────────────────────────────
  // NORMAL → SPECIAL_ENTER (background fades out) → SPECIAL_PLAYING
  //        → SPECIAL_EXIT (special fades out, background fades back in) → NORMAL

  // Resolves true only if this transition was not superseded by a newer one
  async function switchTrack(track) {
    const id = ++transitionId;
    if (isAudible()) await fadeTo(0, TRACK_FADE_OUT_MS);
    if (id !== transitionId) return false;

    if (currentTrack === BACKGROUND_TRACK) backgroundResumeTime = music.currentTime;
    currentTrack = track;
    music.volume = 0;
    music.src = track.src;
    if (track === BACKGROUND_TRACK) {
      try {
        music.currentTime = backgroundResumeTime; // applied once metadata loads
      } catch (e) { /* restarting the loop from 0 is an acceptable fallback */ }
    }

    // Decided before any await: the gesture that unlocks audio may arrive in this same event
    if (!isUnlocked) {
      fadeInOnPlay = true; // stays silent now, fades in as soon as a gesture starts it
      return true;
    }

    const playing = await playCurrentTrack();
    if (id !== transitionId) return false;
    if (playing) {
      await fadeTo(track.volume, TRACK_FADE_IN_MS);
    } else {
      music.volume = track.volume; // muted: ready at the right level for later
    }
    return id === transitionId;
  }

  function playSpecialMusic({ src, volume = SPECIAL_DEFAULT_VOLUME } = {}) {
    if (!music || !src || musicState !== MUSIC_STATE.NORMAL) return Promise.resolve(false);
    musicState = MUSIC_STATE.SPECIAL_ENTER;
    return switchTrack({ src, volume }).then(done => {
      if (done) musicState = MUSIC_STATE.SPECIAL_PLAYING;
      return done;
    });
  }

  function stopSpecialMusic() {
    if (!music || musicState === MUSIC_STATE.NORMAL || musicState === MUSIC_STATE.SPECIAL_EXIT) {
      return Promise.resolve(false);
    }
    musicState = MUSIC_STATE.SPECIAL_EXIT;
    // Stopped while the background was still fading out: just bring it back up
    const restore = currentTrack === BACKGROUND_TRACK ? restoreBackgroundLevel() : switchTrack(BACKGROUND_TRACK);
    return restore.then(done => {
      if (done) musicState = MUSIC_STATE.NORMAL;
      return done;
    });
  }

  async function restoreBackgroundLevel() {
    const id = ++transitionId;
    if (isAudible()) {
      await fadeTo(BACKGROUND_TRACK.volume, TRACK_FADE_IN_MS);
    } else {
      music.volume = BACKGROUND_TRACK.volume;
    }
    return id === transitionId;
  }

  function updateUIState(playing) {
    const toggles = [...document.querySelectorAll('[data-audio-toggle]')];
    const widgets = [
      document.getElementById('audio-widget'),
      document.getElementById('dock-audio-item'),
      document.getElementById('audio-widget-btn'),
      ...toggles
    ].filter(Boolean);

    const icons = [
      document.getElementById('audio-icon'),
      ...document.querySelectorAll('.dock-item-audio i'),
      ...toggles.map(toggle => toggle.querySelector('i'))
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
    isMuted: () => isMuted,
    fadeVolume,
    restoreVolume,
    playSpecialMusic,
    stopSpecialMusic
  };
})();

// A top-level `const` is not a property of window; gallery, share and the album read it as window.AudioEngine
window.AudioEngine = AudioEngine;
