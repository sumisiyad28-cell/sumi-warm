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
const navSections = document.querySelectorAll('section[id]');
const navItems    = document.querySelectorAll('.nav-link');
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navItems.forEach(i => i.classList.toggle('active', i.getAttribute('href') === `#${e.target.id}`));
  });
}, { threshold: 0.3 });
navSections.forEach(s => secObs.observe(s));

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
   THREE.JS 3D CHEMISTRY SCENE
   ========================================================== */
(function () {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('threeCanvas');
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  /* ---- Core setup ---- */
  const scene    = new THREE.Scene();
  scene.fog      = new THREE.FogExp2(0x0d0500, 0.018);

  const camera   = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 200);
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x0d0500);

  const camTarget = new THREE.Vector3(0, 0, 0);

  window.addEventListener('resize', () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });

  /* ---- Lighting ---- */
  scene.add(new THREE.AmbientLight(0x442200, 0.4));

  const nucleusLight = new THREE.PointLight(0xe8952e, 8, 18);
  nucleusLight.position.set(0, 0, 0);
  scene.add(nucleusLight);

  const fillA = new THREE.PointLight(0xe06830, 4, 35);
  fillA.position.set(10, 5, 4);
  scene.add(fillA);

  const fillB = new THREE.PointLight(0xfdb155, 3, 30);
  fillB.position.set(-10, -5, 3);
  scene.add(fillB);

  const h2Light  = new THREE.PointLight(0x44aaff, 5, 22);
  h2Light.position.set(15, 3, -10);
  scene.add(h2Light);

  const h2oLight = new THREE.PointLight(0xff2244, 5, 22);
  h2oLight.position.set(-15, -2, -8);
  scene.add(h2oLight);

  const cellLight = new THREE.PointLight(0x44ccff, 4, 25);
  cellLight.position.set(0, -14, -5);
  scene.add(cellLight);

  const battLight = new THREE.PointLight(0xffcc00, 4, 22);
  battLight.position.set(12, -22, -4);
  scene.add(battLight);

  /* ---- Helpers ---- */
  function mkSphere(r, color, emissive, opacity) {
    const mat = new THREE.MeshPhongMaterial({
      color, emissive, emissiveIntensity: 0.7, shininess: 130,
      transparent: opacity !== undefined && opacity < 1,
      opacity: opacity !== undefined ? opacity : 1
    });
    return new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), mat);
  }

  function mkRing(r, tube, color, opacity) {
    return new THREE.Mesh(
      new THREE.TorusGeometry(r, tube, 8, 120),
      new THREE.MeshPhongMaterial({
        color, emissive: color, emissiveIntensity: 0.25,
        transparent: true, opacity: opacity || 0.55, shininess: 60
      })
    );
  }

  function mkCylinder(rTop, rBot, h, color, emissive) {
    return new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBot, h, 12),
      new THREE.MeshPhongMaterial({ color, emissive: emissive || 0x000000, emissiveIntensity: 0.3, shininess: 150 })
    );
  }

  /* =====================================================
     1. MAIN ATOM — Zinc (Zn) model
     ===================================================== */
  const atomGroup = new THREE.Group();
  scene.add(atomGroup);

  // Nucleus cluster
  const nucColors = [0xe8952e, 0xe06830, 0xfdb155, 0xd4652a, 0xc47c2b];
  for (let i = 0; i < 16; i++) {
    const s = mkSphere(0.17 + Math.random() * 0.1, nucColors[i % 5], 0x6b2000);
    s.position.set(
      (Math.random() - 0.5) * 0.95,
      (Math.random() - 0.5) * 0.95,
      (Math.random() - 0.5) * 0.95
    );
    atomGroup.add(s);
  }

  // Nucleus glow auras
  const aura1 = mkSphere(0.75, 0xc47c2b, 0xc47c2b, 0.18);
  const aura2 = mkSphere(1.2,  0xe8a44a, 0xe8a44a, 0.08);
  const aura3 = mkSphere(1.7,  0xffd080, 0xffaa00, 0.04);
  atomGroup.add(aura1, aura2, aura3);

  // Orbital rings + electrons (4 shells)
  const orbitPivots = [];
  const ringCfg = [
    { r: 2.6,  tube: 0.045, color: 0xc47c2b, rx: Math.PI/2,   ry: 0,          rz: 0,           spd: 1.0,  ne: 2 },
    { r: 3.5,  tube: 0.038, color: 0xd4652a, rx: Math.PI/6,   ry: Math.PI/4,  rz: 0,           spd: 0.68, ne: 8 },
    { r: 4.5,  tube: 0.03,  color: 0xe8a44a, rx: -Math.PI/4,  ry: Math.PI/3,  rz: Math.PI/6,   spd: 0.5,  ne: 8 },
    { r: 5.6,  tube: 0.024, color: 0x9c6020, rx: Math.PI/3,   ry: -Math.PI/5, rz: Math.PI/3,   spd: 0.36, ne: 2 },
  ];

  ringCfg.forEach(cfg => {
    const ring = mkRing(cfg.r, cfg.tube, cfg.color, 0.5);
    ring.rotation.set(cfg.rx, cfg.ry, cfg.rz);
    atomGroup.add(ring);

    const showElectrons = Math.min(cfg.ne, 4); // max 4 visible per shell for performance
    for (let e = 0; e < showElectrons; e++) {
      const tilt = new THREE.Object3D();
      tilt.rotation.set(cfg.rx, cfg.ry, cfg.rz);
      atomGroup.add(tilt);

      const pivot = new THREE.Object3D();
      tilt.add(pivot);

      // Electron: bright core + two glow halos
      const eCore  = mkSphere(0.09, 0xffffff, 0xffdd88);
      const eGlow1 = mkSphere(0.16, 0xffcc44, 0xff8800, 0.45);
      const eGlow2 = mkSphere(0.26, 0xff9900, 0xff4400, 0.18);
      [eCore, eGlow1, eGlow2].forEach(m => { m.position.x = cfg.r; pivot.add(m); });

      orbitPivots.push({ pivot, spd: cfg.spd * (0.75 + Math.random() * 0.5), off: (e / showElectrons) * Math.PI * 2 });
    }
  });

  /* =====================================================
     2. H₂ MOLECULE — green hydrogen output
     ===================================================== */
  const h2Group = new THREE.Group();
  h2Group.position.set(15, 3, -12);
  scene.add(h2Group);

  const hMat = new THREE.MeshPhongMaterial({ color: 0x88ccff, emissive: 0x1a4499, emissiveIntensity: 0.6, shininess: 200 });
  const h2a  = new THREE.Mesh(new THREE.SphereGeometry(0.72, 20, 20), hMat);
  const h2b  = h2a.clone();
  h2a.position.x = -1.1;  h2b.position.x = 1.1;

  const h2Bond = mkCylinder(0.1, 0.1, 2.2, 0xaaddff, 0x224499);
  h2Bond.rotation.z = Math.PI / 2;

  const h2Cloud = mkSphere(1.05, 0x66bbff, 0x1155cc, 0.18);

  const h2GlowSphere = mkSphere(1.8, 0x4499ff, 0x2266cc, 0.06);
  h2Group.add(h2a, h2b, h2Bond, h2Cloud, h2GlowSphere);

  // Electrons orbiting H2
  const h2Pivots = [];
  for (let i = 0; i < 2; i++) {
    const ring = mkRing(1.2, 0.025, 0x88ccff, 0.4);
    ring.rotation.set(Math.PI / 2, 0, i * Math.PI / 2);
    h2Group.add(ring);
    const piv = new THREE.Object3D();
    piv.rotation.set(Math.PI / 2, 0, i * Math.PI / 2);
    h2Group.add(piv);
    const el = mkSphere(0.07, 0xffffff, 0x88ccff);
    el.position.x = 1.2;
    piv.add(el);
    h2Pivots.push({ piv, spd: 1.5 + i * 0.6, off: i * Math.PI });
  }

  /* =====================================================
     3. H₂O MOLECULE — water / electrolyte
     ===================================================== */
  const h2oGroup = new THREE.Group();
  h2oGroup.position.set(-15, -2, -10);
  scene.add(h2oGroup);

  const oMat = new THREE.MeshPhongMaterial({ color: 0xff2244, emissive: 0x990010, emissiveIntensity: 0.7, shininess: 200 });
  const oSph = new THREE.Mesh(new THREE.SphereGeometry(0.88, 20, 20), oMat);
  const oGlow = mkSphere(1.3, 0xff2244, 0xff0022, 0.14);

  const hWMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x6677ff, emissiveIntensity: 0.35, shininess: 150 });
  const hwA = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 16), hWMat);
  const hwB = hwA.clone();
  hwA.position.set(-1.2, -0.85, 0);
  hwB.position.set( 1.2, -0.85, 0);

  const bwMat = new THREE.MeshPhongMaterial({ color: 0xccccff, emissive: 0x4444aa, emissiveIntensity: 0.25 });
  const bwA = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.45, 8), bwMat);
  const bwB = bwA.clone();
  bwA.position.set(-0.6, -0.42, 0); bwA.rotation.z =  Math.PI / 3 + 0.1;
  bwB.position.set( 0.6, -0.42, 0); bwB.rotation.z = -(Math.PI / 3 + 0.1);

  h2oGroup.add(oSph, oGlow, hwA, hwB, bwA, bwB);

  /* =====================================================
     4. ELECTROLYSIS CELL — seawater electrolyzer
     ===================================================== */
  const cellGroup = new THREE.Group();
  cellGroup.position.set(0, -16, -8);
  scene.add(cellGroup);

  // Glass container wireframe
  const boxEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(9, 6, 3.5));
  const boxLine  = new THREE.LineSegments(boxEdges,
    new THREE.LineBasicMaterial({ color: 0x88bbdd, transparent: true, opacity: 0.45 }));
  cellGroup.add(boxLine);

  // Water fill plane
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(8.5, 3.2),
    new THREE.MeshPhongMaterial({ color: 0x3388cc, emissive: 0x112244, emissiveIntensity: 0.3, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.8;
  cellGroup.add(water);

  // Cathode (–) electrode
  const catMat  = new THREE.MeshPhongMaterial({ color: 0x334466, emissive: 0x0a1020, shininess: 220 });
  const cathode = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4, 0.55), catMat);
  cathode.position.set(-2.8, 0.3, 0);
  cellGroup.add(cathode);

  // Anode (+) electrode
  const anodeMat = new THREE.MeshPhongMaterial({ color: 0x774422, emissive: 0x2a0a00, shininess: 220 });
  const anode    = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4, 0.55), anodeMat);
  anode.position.set(2.8, 0.3, 0);
  cellGroup.add(anode);

  // Terminals on top
  const termMat = new THREE.MeshPhongMaterial({ color: 0xc47c2b, emissive: 0x5c3000, shininess: 250 });
  const cathTerm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16), termMat);
  cathTerm.position.set(-2.8, 2.6, 0);
  const anodeTerm = cathTerm.clone();
  anodeTerm.position.set(2.8, 2.6, 0);
  cellGroup.add(cathTerm, anodeTerm);

  // Wire arc between terminals
  const wirePts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    wirePts.push(new THREE.Vector3(-2.8 + t * 5.6, 2.6 + Math.sin(Math.PI * t) * 1.6, 0));
  }
  const wireTube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wirePts), 32, 0.055, 8, false),
    new THREE.MeshPhongMaterial({ color: 0xc47c2b, emissive: 0x5c3000, shininess: 200 })
  );
  cellGroup.add(wireTube);

  // Current flow particles along wire
  const currentPts = [];
  for (let i = 0; i < 12; i++) {
    const cp = mkSphere(0.07, 0xffcc00, 0xff8800);
    cp.userData.t   = i / 12;
    cp.userData.spd = 0.004;
    currentPts.push(cp);
    cellGroup.add(cp);
  }

  // H₂ bubbles at cathode
  const catBubbles = [];
  for (let i = 0; i < 20; i++) {
    const b = mkSphere(0.045 + Math.random() * 0.07, 0xffffff, 0x88ccff, 0.7);
    b.position.set(-2.8 + (Math.random() - 0.5) * 0.5, -2 + Math.random() * 3, (Math.random() - 0.5) * 0.4);
    b.userData.spd   = 0.009 + Math.random() * 0.016;
    b.userData.initY = b.position.y;
    catBubbles.push(b);
    cellGroup.add(b);
  }

  // O₂ bubbles at anode (larger, orange-ish)
  const anodeBubbles = [];
  for (let i = 0; i < 12; i++) {
    const b = mkSphere(0.06 + Math.random() * 0.09, 0xffccaa, 0xff6633, 0.55);
    b.position.set(2.8 + (Math.random() - 0.5) * 0.5, -2 + Math.random() * 3, (Math.random() - 0.5) * 0.4);
    b.userData.spd   = 0.006 + Math.random() * 0.01;
    b.userData.initY = b.position.y;
    anodeBubbles.push(b);
    cellGroup.add(b);
  }

  /* =====================================================
     5. ZN-AIR BATTERY
     ===================================================== */
  const battGroup = new THREE.Group();
  battGroup.position.set(12, -23, -6);
  scene.add(battGroup);

  // Body
  const battBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 2.4, 2),
    new THREE.MeshPhongMaterial({ color: 0x3d1f0a, emissive: 0x0a0400, shininess: 160 })
  );
  battGroup.add(battBody);

  // Zinc face (dark silver-grey)
  const znFace = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 0.12),
    new THREE.MeshPhongMaterial({ color: 0x7a7a55, emissive: 0x222210, shininess: 240 }));
  znFace.position.z = -1.06;
  battGroup.add(znFace);

  // Air cathode (dark carbon)
  const airFace = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 0.12),
    new THREE.MeshPhongMaterial({ color: 0x222233, emissive: 0x05050a, shininess: 200 }));
  airFace.position.z = 1.06;
  battGroup.add(airFace);

  // Terminals
  const bTermMat = new THREE.MeshPhongMaterial({ color: 0xc47c2b, emissive: 0x5c3000, shininess: 260 });
  const posT = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.38, 16), bTermMat);
  posT.position.set(0.8, 1.39, 0);
  const negT = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.38, 16), bTermMat.clone());
  negT.position.set(-0.8, 1.39, 0);
  battGroup.add(posT, negT);

  // Energy particles flowing out
  const battParts = [];
  for (let i = 0; i < 30; i++) {
    const bp = mkSphere(0.065, 0xffcc00, 0xff8800);
    bp.position.set((Math.random() - 0.5) * 5, Math.random() * 4, (Math.random() - 0.5) * 3);
    bp.userData.vx = (Math.random() - 0.5) * 0.04;
    bp.userData.vy = 0.03 + Math.random() * 0.04;
    battParts.push(bp);
    battGroup.add(bp);
  }

  /* =====================================================
     6. BACKGROUND PARTICLE CLOUD
     ===================================================== */
  const pCount = 1500;
  const pPos   = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const phi   = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r     = 6 + Math.random() * 30;
    pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pPos[i * 3 + 2] = r * Math.cos(phi);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo,
    new THREE.PointsMaterial({ color: 0xe8952e, size: 0.09, transparent: true, opacity: 0.55 }));
  scene.add(particles);

  /* =====================================================
     GSAP SCROLL CAMERA JOURNEY
     ===================================================== */
  const hud     = document.getElementById('sceneHud');
  let hudTimer  = null;

  function showHud(icon, text) {
    if (!hud) return;
    hud.querySelector('.scene-hud-icon').textContent = icon;
    hud.querySelector('.scene-hud-text').textContent = text;
    hud.classList.add('visible');
    clearTimeout(hudTimer);
    hudTimer = setTimeout(() => hud.classList.remove('visible'), 3200);
  }

  function flyTo(px, py, pz, tx, ty, tz, dur) {
    if (typeof gsap === 'undefined') return;
    gsap.to(camera.position, { x: px, y: py, z: pz, duration: dur || 1.6, ease: 'power2.inOut' });
    gsap.to(camTarget,       { x: tx, y: ty, z: tz, duration: dur || 1.6, ease: 'power2.inOut' });
  }

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const journey = [
      // About — very close to atom, nucleus + rings fill screen
      { id: '#about',        pos: [0,   0.5, 4],    look: [0,   0,   0],   icon: '⚛',  label: 'Zn Atom — Nucleus & Electron Shells' },
      // Research — dive toward H2O and electrolysis cell in one dramatic pan
      { id: '#research',     pos: [-8,  -0.5, 2],   look: [-13, -1,  -8],  icon: '⚗',  label: 'H₂O Electrolysis Cell' },
      // Education — pull back and rise, particles surround camera like being inside an atom
      { id: '#education',    pos: [0,   3.5,  8.5], look: [0,   0,   0],   icon: '✶', label: 'Atomic Particle Field' },
      // Skills — shoot right to H2 molecule, it fills half the screen
      { id: '#skills',       pos: [11,  2,   2.5],  look: [15,  3,  -10],  icon: '💧', label: 'H₂ Molecule — Green Hydrogen' },
      // Projects — dive down to electrolysis cell from close range
      { id: '#projects',     pos: [1,  -10,   2],   look: [0,  -14,  -6],  icon: '⚡', label: 'Electrochemical Cell — Live Electrolysis' },
      // Achievements — zoom to battery from close side angle
      { id: '#achievements', pos: [8,  -19,   2],   look: [12, -23,  -4],  icon: '🔋', label: 'Zn-Air Battery — Energy Storage' },
      // References — swing back to a nice diagonal atom view
      { id: '#references',   pos: [-4,   3,   7.5], look: [0,   0,   0],   icon: '⚛',  label: 'Zn Atom Model' },
      // Contact — return to hero position
      { id: '#contact',      pos: [0,    0,   9.5], look: [0,   0,   0],   icon: '⚛',  label: 'Zn Atom Model' },
    ];

    journey.forEach((step, idx) => {
      const el = document.querySelector(step.id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        onEnter: () => {
          flyTo(...step.pos, ...step.look);
          showHud(step.icon, step.label);
        },
        onLeaveBack: () => {
          const prev = journey[idx - 1];
          if (prev) { flyTo(...prev.pos, ...prev.look); showHud(prev.icon, prev.label); }
          else flyTo(0, 0, 12, 0, 0, 0);
        }
      });
    });
  }

  /* =====================================================
     ANIMATION LOOP
     ===================================================== */
  let t = 0;
  function animate() {
    t += 0.008;
    requestAnimationFrame(animate);

    /* Electrons orbit */
    orbitPivots.forEach(op => { op.pivot.rotation.z = t * op.spd + op.off; });

    /* Nucleus pulse */
    const pulse = 1 + Math.sin(t * 2.8) * 0.07;
    aura1.scale.setScalar(pulse);
    aura2.scale.setScalar(1 + Math.sin(t * 2.0 + 1) * 0.09);
    aura3.scale.setScalar(1 + Math.sin(t * 1.4 + 2) * 0.12);
    nucleusLight.intensity = 7 + Math.sin(t * 3.2) * 2;

    /* Atom slow auto-rotate */
    atomGroup.rotation.y = t * 0.1;

    /* H₂ molecule */
    h2Group.rotation.y  = t * 0.55;
    h2Group.rotation.x  = Math.sin(t * 0.28) * 0.18;
    h2Pivots.forEach(p => { p.piv.rotation.z = t * p.spd + p.off; });

    /* H₂O molecule */
    h2oGroup.rotation.y = -t * 0.48;
    h2oGroup.rotation.z = Math.sin(t * 0.22) * 0.12;

    /* Particle cloud drift */
    particles.rotation.y = t * 0.012;
    particles.rotation.x = t * 0.005;

    /* Cathode H₂ bubbles */
    catBubbles.forEach(b => {
      b.position.y += b.userData.spd;
      if (b.position.y > 2.5) b.position.y = b.userData.initY;
    });

    /* Anode O₂ bubbles */
    anodeBubbles.forEach(b => {
      b.position.y += b.userData.spd;
      if (b.position.y > 2.5) b.position.y = b.userData.initY;
    });

    /* Current particles along wire arc */
    currentPts.forEach(cp => {
      cp.userData.t = (cp.userData.t + cp.userData.spd) % 1;
      const tf = cp.userData.t;
      cp.position.x = -2.8 + tf * 5.6;
      cp.position.y = 2.6 + Math.sin(Math.PI * tf) * 1.6;
    });

    /* Battery energy particles */
    battParts.forEach(bp => {
      bp.position.y += bp.userData.vy;
      bp.position.x += bp.userData.vx;
      if (bp.position.y > 4.5) {
        bp.position.y = 0;
        bp.position.x = (Math.random() - 0.5) * 5;
      }
    });

    /* Camera lookAt (GSAP animates camTarget) */
    camera.lookAt(camTarget);

    renderer.render(scene, camera);
  }
  animate();
})();
