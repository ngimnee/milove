/* --------------------------------------------------------------------------
   SHOOTING STAR & METEOR STREAKS CANVAS ENGINE
   -------------------------------------------------------------------------- */

const MeteorEngine = (function() {
  'use strict';

  let canvas, ctx;
  let width, height;
  let meteors = [];

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'meteor-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-6';
    document.getElementById('bg-canvas-container').appendChild(canvas);

    ctx = canvas.getContext('2d');
    resize();

    window.addEventListener('resize', resize);

    // Schedule shooting stars every 4 to 8 seconds
    scheduleMeteor();
    animate();
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function scheduleMeteor() {
    createMeteor();
    const delay = Math.random() * 4000 + 4000;
    setTimeout(scheduleMeteor, delay);
  }

  function createMeteor() {
    const startX = Math.random() * (width * 0.8) + width * 0.2;
    const startY = Math.random() * (height * 0.3);
    const length = Math.random() * 150 + 120;
    const speed = Math.random() * 12 + 10;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2; // ~45 deg downward slope

    meteors.push({
      x: startX,
      y: startY,
      length: length,
      speed: speed,
      dx: -Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      opacity: 1,
      decay: 0.015,
      size: Math.random() * 2 + 1.5
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.dx;
      m.y += m.dy;
      m.opacity -= m.decay;

      if (m.opacity <= 0 || m.y > height || m.x < 0) {
        meteors.splice(i, 1);
        continue;
      }

      // Draw Glowing Meteor Trail
      const tailX = m.x - m.dx * (m.length / m.speed);
      const tailY = m.y - m.dy * (m.length / m.speed);

      const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`);
      gradient.addColorStop(0.3, `rgba(255, 105, 180, ${m.opacity * 0.8})`);
      gradient.addColorStop(0.7, `rgba(0, 242, 254, ${m.opacity * 0.4})`);
      gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

      ctx.save();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = m.size;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Glowing Star Head
      ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f2fe';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size + 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  return {
    init,
    triggerManual: createMeteor
  };
})();
