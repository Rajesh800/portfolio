/* =============================================
   SCRIPT — Awwwards Portfolio
   Rajesh Thangenapally
   ============================================= */

'use strict';

// ─────────────────────────────────────────────
// CUSTOM CURSOR
// ─────────────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');
  if (!cursor || !trail) return;

  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;
  let animId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  function animateTrail() {
    trailX += (mouseX - trailX) * 0.18;
    trailY += (mouseY - trailY) * 0.18;
    trail.style.left = trailX + 'px';
    trail.style.top  = trailY + 'px';
    animId = requestAnimationFrame(animateTrail);
  }
  animateTrail();
}

// ─────────────────────────────────────────────
// SCROLL PROGRESS BAR
// ─────────────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  const links  = document.getElementById('nav-links');
  const navItems = document.querySelectorAll('.nav__item');

  // Solidify on scroll
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('solid', window.scrollY > 40);
  }, { passive: true });

  // Burger toggle
  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    links?.classList.toggle('open');
  });

  // Close on link click
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      burger?.classList.remove('open');
      links?.classList.remove('open');
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  function setActive() {
    const offset = 100;
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - offset) {
        current = section.id;
      }
    });
    navItems.forEach(item => {
      const href = item.getAttribute('href')?.replace('#', '');
      item.style.color = href === current ? 'var(--white)' : '';
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });
}

// ─────────────────────────────────────────────
// HERO CANVAS — Solar System
// ─────────────────────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById('solar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, cx, cy, time = 0;

  // Star field
  const STAR_COUNT = 220;
  let stars = [];

  // Planets definition: name, orbitRadius, size, color, speed, moons, glowColor, rings
  const planets = [
    { name: 'Mercury', orbitR: 0,   r: 4,    color: '#b5b5b5', speed: 4.74,  moons: [],                    glow: '#d4d4d4', rings: false },
    { name: 'Venus',   orbitR: 0,   r: 7,    color: '#e8cda0', speed: 3.50,  moons: [],                    glow: '#f5e6c8', rings: false },
    { name: 'Earth',   orbitR: 0,   r: 7.5,  color: '#4f8ef7', speed: 2.98,  moons: [{ r: 3, orbitR: 18, speed: 13.1, color: '#c8c8c8' }], glow: '#6aadff', rings: false },
    { name: 'Mars',    orbitR: 0,   r: 5.5,  color: '#c1440e', speed: 2.41,  moons: [{ r: 2, orbitR: 14, speed: 16, color: '#aaa' }],  glow: '#e05020', rings: false },
    { name: 'Jupiter', orbitR: 0,   r: 18,   color: '#c88b3a', speed: 1.31,  moons: [
        { r: 3, orbitR: 27, speed: 20, color: '#d4b896' },
        { r: 2.5, orbitR: 35, speed: 14, color: '#c8c8c8' },
      ], glow: '#e0a04a', rings: false },
    { name: 'Saturn',  orbitR: 0,   r: 15,   color: '#e4d191', speed: 0.97,  moons: [{ r: 2, orbitR: 22, speed: 11, color: '#bbb' }], glow: '#f0e0a0', rings: true },
    { name: 'Uranus',  orbitR: 0,   r: 10,   color: '#7de8e8', speed: 0.68,  moons: [],                    glow: '#a0f4f4', rings: false },
    { name: 'Neptune', orbitR: 0,   r: 9.5,  color: '#4b70dd', speed: 0.54,  moons: [],                    glow: '#6080ff', rings: false },
  ];

  // Orbit radii scaled to canvas
  const ORBIT_BASE = [0.09, 0.14, 0.20, 0.27, 0.38, 0.50, 0.63, 0.76];
  const SUN_R_FACTOR = 0.055;

  // Angle trackers
  const angles = planets.map(() => Math.random() * Math.PI * 2);
  const moonAngles = planets.map(p => p.moons.map(() => Math.random() * Math.PI * 2));

  // Asteroid belt particles
  let asteroids = [];
  const ASTEROID_COUNT = 140;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W * 0.68;   // sun offset right so text on left is clear
    cy = H * 0.46;

    const minDim = Math.min(W, H);
    planets.forEach((p, i) => {
      p.orbitR = minDim * ORBIT_BASE[i];
    });

    // Regenerate stars
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      a: Math.random() * 0.7 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    // Asteroid belt between Mars (3) and Jupiter (4)
    asteroids = Array.from({ length: ASTEROID_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const spread = (planets[4].orbitR - planets[3].orbitR);
      const r = planets[3].orbitR + spread * 0.1 + Math.random() * spread * 0.8;
      return {
        angle, r,
        speed: 0.0003 + Math.random() * 0.0002,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.5 + 0.2,
      };
    });
  }

  function drawStars(t) {
    stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed * 60 + s.twinkleOffset);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a * twinkle})`;
      ctx.fill();
    });
  }

  function drawOrbit(r, alpha = 0.12) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawSun(t) {
    const sunR = Math.min(W, H) * SUN_R_FACTOR;

    // Outer corona pulses
    for (let i = 3; i > 0; i--) {
      const pulse = 1 + 0.06 * Math.sin(t * 0.8 + i);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * i * 1.8 * pulse);
      grad.addColorStop(0, `rgba(255,200,50,${0.07 / i})`);
      grad.addColorStop(1, 'rgba(255,150,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * i * 1.8 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Sun body gradient
    const sunGrad = ctx.createRadialGradient(cx - sunR * 0.3, cy - sunR * 0.3, 0, cx, cy, sunR);
    sunGrad.addColorStop(0, '#fff7c0');
    sunGrad.addColorStop(0.3, '#ffe066');
    sunGrad.addColorStop(0.7, '#ff9900');
    sunGrad.addColorStop(1, '#e05000');
    ctx.beginPath();
    ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // Sun surface shimmer
    const shimmer = ctx.createRadialGradient(cx, cy, sunR * 0.5, cx, cy, sunR);
    shimmer.addColorStop(0, 'rgba(255,255,255,0)');
    shimmer.addColorStop(0.8, `rgba(255,200,100,${0.08 + 0.04 * Math.sin(t * 1.2)})`);
    shimmer.addColorStop(1, 'rgba(255,100,0,0.15)');
    ctx.beginPath();
    ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
    ctx.fillStyle = shimmer;
    ctx.fill();
  }

  function drawAsteroids(t) {
    asteroids.forEach(a => {
      a.angle += a.speed;
      const x = cx + Math.cos(a.angle) * a.r;
      const y = cy + Math.sin(a.angle) * a.r;
      ctx.beginPath();
      ctx.arc(x, y, a.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,160,140,${a.alpha})`;
      ctx.fill();
    });
  }

  function drawPlanet(planet, angle, moonAngleArr, t) {
    const px = cx + Math.cos(angle) * planet.orbitR;
    const py = cy + Math.sin(angle) * planet.orbitR;

    // Planet glow
    const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, planet.r * 2.8);
    glowGrad.addColorStop(0, planet.glow + '55');
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(px, py, planet.r * 2.8, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Saturn rings
    if (planet.rings) {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1, 0.32);
      ctx.beginPath();
      ctx.arc(0, 0, planet.r * 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(228,209,145,0.45)';
      ctx.lineWidth = planet.r * 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, planet.r * 2.0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,180,100,0.25)';
      ctx.lineWidth = planet.r * 0.4;
      ctx.stroke();
      ctx.restore();
    }

    // Planet body
    const pGrad = ctx.createRadialGradient(
      px - planet.r * 0.3, py - planet.r * 0.3, 0,
      px, py, planet.r
    );
    pGrad.addColorStop(0, planet.glow);
    pGrad.addColorStop(1, planet.color);
    ctx.beginPath();
    ctx.arc(px, py, planet.r, 0, Math.PI * 2);
    ctx.fillStyle = pGrad;
    ctx.fill();

    // Moons
    planet.moons.forEach((moon, mi) => {
      const mAngle = moonAngleArr[mi];
      const mx = px + Math.cos(mAngle) * moon.orbitR;
      const my = py + Math.sin(mAngle) * moon.orbitR;
      // Moon orbit ring
      ctx.beginPath();
      ctx.arc(px, py, moon.orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 0.4;
      ctx.stroke();
      // Moon body
      ctx.beginPath();
      ctx.arc(mx, my, moon.r, 0, Math.PI * 2);
      ctx.fillStyle = moon.color;
      ctx.fill();
    });
  }

  function drawAsteroidBeltRing() {
    const innerR = planets[3].orbitR * 1.15;
    const outerR = planets[4].orbitR * 0.85;
    const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
    grad.addColorStop(0, 'rgba(160,140,120,0)');
    grad.addColorStop(0.4, 'rgba(160,140,120,0.04)');
    grad.addColorStop(1, 'rgba(160,140,120,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function animate() {
    time += 0.016;
    ctx.clearRect(0, 0, W, H);

    // Deep space bg gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx * 0.5, cy * 0.5, Math.max(W, H));
    bgGrad.addColorStop(0, 'rgba(12,6,30,1)');
    bgGrad.addColorStop(0.5, 'rgba(6,6,18,1)');
    bgGrad.addColorStop(1, 'rgba(4,4,12,1)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    drawStars(time);
    drawAsteroidBeltRing();

    // Draw orbits
    planets.forEach(p => drawOrbit(p.orbitR));

    // Draw asteroid belt particles
    drawAsteroids(time);

    // Draw sun
    drawSun(time);

    // Update & draw planets
    planets.forEach((p, i) => {
      angles[i] += (p.speed * 0.00025);
      moonAngles[i].forEach((_, mi) => {
        moonAngles[i][mi] += (p.moons[mi].speed * 0.0008);
      });
      drawPlanet(p, angles[i], moonAngles[i], time);
    });

    requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener('resize', resize, { passive: true });
}

// ─────────────────────────────────────────────
// COUNTER ANIMATION
// ─────────────────────────────────────────────
function animateCounters() {
  const els = document.querySelectorAll('.hero__stat-n[data-count]');
  let done = false;

  function run() {
    if (done) return;
    done = true;
    els.forEach(el => {
      const target = parseInt(el.getAttribute('data-count'));
      const dur = 1600;
      const step = target / (dur / 16);
      let cur = 0;
      const t = setInterval(() => {
        cur += step;
        if (cur >= target) { el.textContent = target; clearInterval(t); }
        else el.textContent = Math.floor(cur);
      }, 16);
    });
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) run(); });
  }, { threshold: 0.3 });

  const statsEl = document.querySelector('.hero__stats');
  if (statsEl) obs.observe(statsEl);
}

// ─────────────────────────────────────────────
// REVEAL ON SCROLL
// ─────────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

// ─────────────────────────────────────────────
// ANIMATED NEURAL NET WEIGHTS
// ─────────────────────────────────────────────
function initNeuralNet() {
  const nodes = document.querySelectorAll('.nn-node');
  if (!nodes.length) return;

  setInterval(() => {
    nodes.forEach(node => {
      if (Math.random() > 0.65) {
        node.classList.toggle('nn-node--active');
      }
    });
  }, 1200);
}

// ─────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────
function submitForm(event) {
  event.preventDefault();
  const form   = event.target;
  const btn    = document.getElementById('f-submit');
  const btnTxt = document.getElementById('f-btn-txt');
  const success = document.getElementById('f-success');

  btn.disabled = true;
  btnTxt.textContent = 'Sending…';

  const name    = form.name?.value || '';
  const email   = form.email?.value || '';
  const subject = form.subject?.value || 'Portfolio Contact';
  const message = form.message?.value || '';

  setTimeout(() => {
    btn.disabled = false;
    btnTxt.textContent = 'Send Message';
    success.style.display = 'block';
    form.reset();

    window.location.href = `mailto:thangenapally.rajesh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`)}`;

    setTimeout(() => { success.style.display = 'none'; }, 6000);
  }, 900);
}

// ─────────────────────────────────────────────
// SMOOTH SCROLL
// ─────────────────────────────────────────────
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  const navH = document.getElementById('nav')?.offsetHeight || 72;
  window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
});

// ─────────────────────────────────────────────
// FOOTER YEAR
// ─────────────────────────────────────────────
function setYear() {
  const el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();
}

// ─────────────────────────────────────────────
// PROJECT ITEMS — hover expand
// ─────────────────────────────────────────────
function initProjectHover() {
  document.querySelectorAll('.proj-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.paddingTop = '3.5rem';
      item.style.paddingBottom = '3.5rem';
    });
    item.addEventListener('mouseleave', () => {
      item.style.paddingTop = '';
      item.style.paddingBottom = '';
    });
  });
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollProgress();
  initNav();
  initHeroCanvas();
  animateCounters();
  initReveal();
  initNeuralNet();
  setYear();
  initProjectHover();

  console.log(
    '%c🚀 Rajesh Thangenapally · Portfolio',
    'font-size:16px;font-weight:800;color:#4f8ef7;background:#0a0a0f;padding:8px 16px;border-radius:6px;'
  );
  console.log(
    '%cTechnical Lead @ ETP · AI/ML Engineer · Lead Java Developer · 10 Years EXP',
    'font-size:12px;color:#7a7a9a;'
  );
});
