/* --------------------------------------------------------------------------
   THREE.JS 3D GALAXY & NEBULA STARFIELD ENGINE
   Driven by AmbientLoop (frame-rate independent, rests while the letter is
   open). Without Three.js or WebGL it falls back to 2D canvas stars; with
   reduced motion it draws one still frame.
   -------------------------------------------------------------------------- */

const GalaxyEngine = (function() {
  'use strict';

  const SMALL_SCREEN_QUERY = '(max-width: 768px)';
  // Per 60 fps frame, as before; scaled by the real frame time
  const STAR_SPIN = { y: 0.0008, x: 0.0003 };
  const NEBULA_SPIN = { y: -0.0005, z: 0.0002 };
  const CAMERA_FOLLOW = 0.05;

  let scene, camera, renderer;
  let starParticles, nebulaParticles;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;

  function init() {
    const canvas = document.getElementById('galaxy-canvas');
    if (!canvas) return;

    // Check if Three.js library exists
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. Falling back to 2D Canvas Galaxy.');
      initCanvasFallback(canvas);
      return;
    }

    // 1. Renderer first: without WebGL (old GPU, hardware acceleration off) it throws,
    //    and the 2D stars take over instead of the whole page stopping here
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (err) {
      console.warn('WebGL unavailable. Falling back to 2D Canvas Galaxy.', err);
      renderer = null;
      initCanvasFallback(canvas);
      return;
    }
    const maxPixelRatio = window.matchMedia(SMALL_SCREEN_QUERY).matches ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 2. Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06050e, 0.0008);

    // 3. Camera Setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 800;

    // 4. Create 3D Stars Geometry
    const starCount = 4500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xff69b4), // Pink
      new THREE.Color(0x9b51e0), // Purple
      new THREE.Color(0x00f2fe), // Cyan
      new THREE.Color(0xffffff), // White
      new THREE.Color(0xffd1dc)  // Rose
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 2000;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 2000;

      const color = palette[Math.floor(Math.random() * palette.length)];
      starColors[i3] = color.r;
      starColors[i3 + 1] = color.g;
      starColors[i3 + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // Particle Texture Generator
    const starMaterial = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    starParticles = new THREE.Points(starGeometry, starMaterial);
    scene.add(starParticles);

    // 5. Create Glowing Nebula Particles
    const nebulaCount = 600;
    const nebulaGeometry = new THREE.BufferGeometry();
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
      const i3 = i * 3;
      nebulaPositions[i3] = (Math.random() - 0.5) * 1200;
      nebulaPositions[i3 + 1] = (Math.random() - 0.5) * 1200;
      nebulaPositions[i3 + 2] = (Math.random() - 0.5) * 1200;

      const c = palette[i % palette.length];
      nebulaColors[i3] = c.r;
      nebulaColors[i3 + 1] = c.g;
      nebulaColors[i3 + 2] = c.b;
    }

    nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

    const nebulaMaterial = new THREE.PointsMaterial({
      size: 14,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    nebulaParticles = new THREE.Points(nebulaGeometry, nebulaMaterial);
    scene.add(nebulaParticles);

    // 6. Listeners & Animation Loop (reduced motion: one still frame, no parallax)
    window.addEventListener('resize', onWindowResize);
    if (AmbientLoop.reducedMotion) {
      render();
    } else {
      window.addEventListener('mousemove', onDocumentMouseMove);
      AmbientLoop.add(animate);
    }
  }

  function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.5;
    mouseY = (event.clientY - windowHalfY) * 0.5;
  }

  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (AmbientLoop.reducedMotion) render();
  }

  function animate(dt) {
    const f = dt * 60; // 1 = one 60 fps frame
    const follow = 1 - Math.pow(1 - CAMERA_FOLLOW, f);

    targetX += (mouseX - targetX) * follow;
    targetY += (mouseY - targetY) * follow;

    starParticles.rotation.y += STAR_SPIN.y * f;
    starParticles.rotation.x += STAR_SPIN.x * f;
    nebulaParticles.rotation.y += NEBULA_SPIN.y * f;
    nebulaParticles.rotation.z += NEBULA_SPIN.z * f;

    camera.position.x += (targetX - camera.position.x) * follow;
    camera.position.y += (-targetY - camera.position.y) * follow;
    render();
  }

  function render() {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }

  // 2D Canvas Fallback if Three.js or WebGL is not available
  function initCanvasFallback(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    }));

    function drawFallback(dt) {
      const f = dt * 60;
      ctx.clearRect(0, 0, width, height);
      stars.forEach(s => {
        s.alpha += s.speed * f;
        if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
        ctx.fillStyle = `rgba(255, 182, 193, ${Math.min(1, Math.abs(s.alpha))})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (AmbientLoop.reducedMotion) drawFallback(0);
    });

    if (AmbientLoop.reducedMotion) {
      drawFallback(0);
    } else {
      AmbientLoop.add(drawFallback);
    }
  }

  return {
    init
  };
})();
