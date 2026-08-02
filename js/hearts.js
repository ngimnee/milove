/* --------------------------------------------------------------------------
   FLOATING HEARTS PARTICLES CANVAS ENGINE
   -------------------------------------------------------------------------- */

const HeartsEngine = (function() {
  'use strict';

  let canvas, ctx;
  let width, height;
  let hearts = [];
  const heartCount = 180; // High density romantic ambient hearts

  function init() {
    canvas = document.getElementById('effects-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();
    createHearts();

    window.addEventListener('resize', resize);
    animate();
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createHearts() {
    hearts = [];
    const colors = ['#ff69b4', '#ff2a70', '#ffb6c1', '#9b51e0', '#ffffff'];

    for (let i = 0; i < heartCount; i++) {
      hearts.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 14 + 8,
        speedY: Math.random() * 1.2 + 0.4,
        speedX: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.7 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.03 + 0.01,
        blur: Math.random() > 0.6
      });
    }
  }

  function drawHeart(x, y, size, color, opacity, blur) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;

    if (blur) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
    }

    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    // Left curve
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size * 0.8, 0, size);
    // Right curve
    ctx.bezierCurveTo(0, size * 0.8, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    hearts.forEach(h => {
      h.swing += h.swingSpeed;
      h.x += Math.sin(h.swing) * h.speedX;
      h.y -= h.speedY;

      // Wrap around top to bottom
      if (h.y < -30) {
        h.y = height + 30;
        h.x = Math.random() * width;
      }
      if (h.x < -30) h.x = width + 30;
      if (h.x > width + 30) h.x = -30;

      drawHeart(h.x, h.y, h.size, h.color, h.opacity, h.blur);
    });

    requestAnimationFrame(animate);
  }

  return {
    init
  };
})();
