/* --------------------------------------------------------------------------
   FALLING SAKURA (CHERRY BLOSSOM) PETALS CANVAS ENGINE
   -------------------------------------------------------------------------- */

const SakuraEngine = (function() {
  'use strict';

  let canvas, ctx;
  let width, height;
  let petals = [];
  const petalCount = 45;

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'sakura-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-7';
    document.getElementById('bg-canvas-container').appendChild(canvas);

    ctx = canvas.getContext('2d');
    resize();
    createPetals();

    window.addEventListener('resize', resize);
    animate();
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createPetals() {
    petals = [];
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 10 + 8,
        speedY: Math.random() * 1.5 + 0.8,
        speedX: Math.random() * 1.2 - 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        oscillation: Math.random() * Math.PI * 2,
        oscillationSpeed: Math.random() * 0.02 + 0.01,
        opacity: Math.random() * 0.7 + 0.3
      });
    }
  }

  function drawPetal(x, y, size, rotation, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;

    // Sakura Pink Gradient
    const gradient = ctx.createLinearGradient(-size, -size, size, size);
    gradient.addColorStop(0, '#ffb7c5');
    gradient.addColorStop(0.6, '#ff69b4');
    gradient.addColorStop(1, '#ff3385');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.8, -size * 0.5, size * 0.8, size * 0.5, 0, size);
    ctx.bezierCurveTo(-size * 0.8, size * 0.5, -size * 0.8, -size * 0.5, 0, -size);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    petals.forEach(p => {
      p.oscillation += p.oscillationSpeed;
      p.x += Math.sin(p.oscillation) * 1.5 + p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -20;
      if (p.x < -20) p.x = width + 20;

      drawPetal(p.x, p.y, p.size, p.rotation, p.opacity);
    });

    requestAnimationFrame(animate);
  }

  return {
    init
  };
})();
