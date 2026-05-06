/* ==========================================================
   SCROLL PROGRESS + NAVBAR
   ========================================================== */
const scrollProgress = document.getElementById('scrollProgress');
const navbar         = document.getElementById('navbar');
const backToTop      = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const top    = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = `${(top / height) * 100}%`;
  navbar.classList.toggle('scrolled', top > 50);
  backToTop.classList.toggle('visible', top > 400);
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ==========================================================
   HAMBURGER
   ========================================================== */
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

function closeNav() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', open);
  navOverlay.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navOverlay.addEventListener('click', closeNav);
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeNav));

/* ==========================================================
   FADE-IN OBSERVER
   ========================================================== */
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    setTimeout(() => e.target.classList.add('visible'), parseInt(e.target.dataset.delay || 0));
    fadeObs.unobserve(e.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach((el, i) => {
  el.dataset.delay = (i % 5) * 80;
  fadeObs.observe(el);
});

/* ==========================================================
   ACTIVE NAV
   ========================================================== */
const sections = document.querySelectorAll('section[id]');
const navItems  = document.querySelectorAll('.nav-link');
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    navItems.forEach(i => i.classList.toggle('active', i.getAttribute('href') === `#${id}`));
  });
}, { threshold: 0.3 });
sections.forEach(s => secObs.observe(s));

/* ==========================================================
   LANGUAGE BARS
   ========================================================== */
const langFills = document.querySelectorAll('.lang-fill');
langFills.forEach(f => { f.style.width = '0'; });
const langObs = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  langFills.forEach((f, i) => setTimeout(() => { f.style.width = f.dataset.width; }, 200 + i * 120));
  langObs.disconnect();
}, { threshold: 0.4 });
const langGrid = document.querySelector('.lang-rows');
if (langGrid) langObs.observe(langGrid);

/* ==========================================================
   AUTUMN LEAF CANVAS
   ========================================================== */
(function () {
  const canvas = document.getElementById('leafCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let leaves = [];
  let rafId;

  const COLORS = [
    '#c47c2b', '#d4652a', '#e8a44a', '#b5532a',
    '#d4a520', '#9c3d12', '#e8956d', '#7c4a2d'
  ];

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { cancelAnimationFrame(rafId); resize(); animate(); });

  class Leaf {
    constructor(randomY) {
      this.spawn(randomY);
    }
    spawn(randomY) {
      this.x     = Math.random() * canvas.width;
      this.y     = randomY ? Math.random() * canvas.height : -20;
      this.size  = Math.random() * 9 + 5;
      this.vy    = Math.random() * 0.6 + 0.25;
      this.vx    = (Math.random() - 0.5) * 0.5;
      this.angle = Math.random() * Math.PI * 2;
      this.spin  = (Math.random() - 0.5) * 0.025;
      this.life  = randomY ? Math.random() * 0.6 + 0.4 : 1;
      this.decay = 0.0008 + Math.random() * 0.001;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.swing = Math.random() * 0.012 + 0.004;
      this.swingOffset = Math.random() * Math.PI * 2;
      this.t     = 0;
    }
    update() {
      this.t    += 1;
      this.x    += this.vx + Math.sin(this.t * this.swing + this.swingOffset) * 0.4;
      this.y    += this.vy;
      this.angle += this.spin;
      this.life -= this.decay;
    }
    draw() {
      const alpha = Math.max(0, this.life) * 0.85;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = alpha;

      // Leaf body — oval bezier shape
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(
        this.size * 0.7, -this.size * 0.4,
        this.size * 0.7,  this.size * 0.4,
        0, this.size
      );
      ctx.bezierCurveTo(
        -this.size * 0.7,  this.size * 0.4,
        -this.size * 0.7, -this.size * 0.4,
        0, -this.size
      );
      ctx.fillStyle = this.color;
      ctx.fill();

      // Midrib
      ctx.beginPath();
      ctx.moveTo(0, -this.size * 0.9);
      ctx.lineTo(0,  this.size * 0.9);
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
    dead() { return this.life <= 0 || this.y > canvas.height + 30; }
  }

  // Seed initial leaves spread across the screen
  for (let i = 0; i < 35; i++) {
    leaves.push(new Leaf(true));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (leaves.length < 55 && Math.random() < 0.28) {
      leaves.push(new Leaf(false));
    }

    leaves.forEach(l => { l.update(); l.draw(); });
    leaves = leaves.filter(l => !l.dead());

    rafId = requestAnimationFrame(animate);
  }
  animate();
})();
