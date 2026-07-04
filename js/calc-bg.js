/**
 * calc-bg.js
 * Lightweight Canvas 2D animated circuit-board / neural-network background
 * for the Engineering Calculators section. No Three.js — uses native 2D API.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('calc-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const section = document.getElementById('calculators');
  if (!section) return;

  /* ── SIZE ───────────────────────────── */
  function resize() {
    canvas.width  = section.offsetWidth;
    canvas.height = section.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); buildNodes(); }, { passive: true });

  /* ── THEME COLOUR DETECTION ─────────── */
  function getColors() {
    const isLight = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-primary').trim().startsWith('#f');
    return {
      node:       isLight ? 'rgba(29,78,216,0.55)'  : 'rgba(56,189,248,0.55)',
      nodePulse:  isLight ? 'rgba(29,78,216,0.9)'   : 'rgba(56,189,248,0.9)',
      line:       isLight ? 'rgba(29,78,216,0.12)'  : 'rgba(37,99,235,0.18)',
      glow:       isLight ? 'rgba(29,78,216,0.06)'  : 'rgba(56,189,248,0.08)',
      corner:     isLight ? 'rgba(29,78,216,0.15)'  : 'rgba(56,189,248,0.2)',
      grid:       isLight ? 'rgba(29,78,216,0.04)'  : 'rgba(37,99,235,0.05)',
    };
  }

  /* ── NODES ──────────────────────────── */
  const CONNECT_DIST = 160;
  let nodes = [];

  function buildNodes() {
    const count = Math.floor((canvas.width * canvas.height) / 18000);
    nodes = [];
    for (let i = 0; i < Math.max(count, 20); i++) {
      nodes.push({
        x:    Math.random() * canvas.width,
        y:    Math.random() * canvas.height,
        vx:   (Math.random() - 0.5) * 0.35,
        vy:   (Math.random() - 0.5) * 0.35,
        r:    Math.random() * 2.2 + 1.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.4,
        // L-shaped corner: some nodes are "junction" nodes
        isJunction: Math.random() < 0.25,
      });
    }
  }
  buildNodes();

  /* ── DRAW CORNER / JUNCTION ─────────── */
  function drawJunction(x, y, r, color) {
    const size = r * 4;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    // Small crosshair
    ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
    ctx.stroke();
    // Corner brackets
    const b = size * 1.4;
    ctx.beginPath();
    ctx.moveTo(x - b, y - b + 4); ctx.lineTo(x - b, y - b); ctx.lineTo(x - b + 4, y - b);
    ctx.moveTo(x + b - 4, y - b); ctx.lineTo(x + b, y - b); ctx.lineTo(x + b, y - b + 4);
    ctx.moveTo(x + b, y + b - 4); ctx.lineTo(x + b, y + b); ctx.lineTo(x + b - 4, y + b);
    ctx.moveTo(x - b + 4, y + b); ctx.lineTo(x - b, y + b); ctx.lineTo(x - b, y + b - 4);
    ctx.stroke();
  }

  /* ── DRAW GRID ──────────────────────── */
  function drawGrid(colors) {
    const spacing = 60;
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += spacing) {
      ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += spacing) {
      ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
  }

  /* ── MAIN LOOP ──────────────────────── */
  let time = 0;
  let raf;

  function draw() {
    raf = requestAnimationFrame(draw);
    time += 0.016;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = getColors();

    // Grid
    drawGrid(colors);

    // Update + draw nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      // Soft boundary bounce
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      n.x = Math.max(0, Math.min(canvas.width,  n.x));
      n.y = Math.max(0, Math.min(canvas.height, n.y));
    });

    // Draw connections first (under nodes)
    ctx.lineWidth = 0.8;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[j].x - nodes[i].x;
        const dy   = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = 1 - dist / CONNECT_DIST;

          // Occasional L-shaped route (circuit board style) instead of straight line
          if (nodes[i].isJunction || nodes[j].isJunction) {
            const mid = nodes[i].x + dx * 0.5;
            ctx.strokeStyle = colors.line.replace(')', `,${alpha * 0.7})`).replace('rgba', 'rgba');
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mid, nodes[i].y);       // horizontal
            ctx.lineTo(mid, nodes[j].y);       // vertical
            ctx.lineTo(nodes[j].x, nodes[j].y); // horizontal
            ctx.stroke();
          } else {
            ctx.strokeStyle = colors.line;
            ctx.globalAlpha = alpha * 0.7;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      const pulse = Math.sin(time * n.speed + n.phase);
      const radius = n.r + pulse * 0.5;
      const opacity = 0.5 + pulse * 0.3;

      // Glow
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 6);
      grd.addColorStop(0, colors.glow);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius * 6, 0, Math.PI * 2);
      ctx.fill();

      if (n.isJunction) {
        drawJunction(n.x, n.y, radius, colors.corner);
      } else {
        // Square nodes (engineering / technical feel)
        ctx.fillStyle = colors.node;
        ctx.globalAlpha = opacity;
        ctx.fillRect(n.x - radius, n.y - radius, radius * 2, radius * 2);
        ctx.globalAlpha = 1;
      }
    });

    // Floating scan line (subtle, slow)
    const scanY = ((time * 14) % (canvas.height + 40)) - 20;
    const scanGrd = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 8);
    scanGrd.addColorStop(0, 'transparent');
    scanGrd.addColorStop(0.5, getColors().line);
    scanGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = scanGrd;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, scanY - 8, canvas.width, 16);
    ctx.globalAlpha = 1;
  }

  /* ── START ONLY WHEN IN VIEW ────────── */
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { if (!raf) draw(); }
        else                  { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0.05 });
    obs.observe(section);
  } else {
    draw();
  }

})();
