/**
 * three-scene.js — Mechanical AI Hero
 * Two interlocking wireframe gears + orbital rings + neural network nodes + particles
 * Three.js r128 | Skips on mobile + reduced-motion
 */

(function () {
  'use strict';

  if (window.innerWidth < 768) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── DETECT THEME ──────────────────────────────── */
  const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

  /* ── SCENE / CAMERA / RENDERER ──────────────────── */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  /* ── MATERIALS FACTORY ───────────────────────────── */
  function mat(color, opacity, wireframe) {
    return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, wireframe: !!wireframe });
  }
  function lineMat(color, opacity) {
    return new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  }

  /* ── BUILD GEAR ──────────────────────────────────── */
  function buildGear(outerR, innerR, teethN, color, baseOpacity) {
    const g = new THREE.Group();
    const op = baseOpacity;

    // Outer ring
    g.add(new THREE.Mesh(new THREE.TorusGeometry(outerR, 0.038, 8, 80), mat(color, op)));
    // Inner ring
    g.add(new THREE.Mesh(new THREE.TorusGeometry(innerR, 0.022, 6, 60), mat(color, op * 0.75)));
    // Hub
    g.add(new THREE.Mesh(new THREE.TorusGeometry(outerR * 0.13, 0.026, 6, 24), mat(color, op)));

    // Teeth
    for (let i = 0; i < teethN; i++) {
      const angle = (i / teethN) * Math.PI * 2;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.19, 0.04), mat(color, op * 0.9));
      const r = outerR + 0.095;
      tooth.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
      tooth.rotation.z = angle;
      g.add(tooth);
    }

    // Spokes
    const spokeCount = Math.floor(teethN / 2);
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(Math.cos(angle) * outerR * 0.16, Math.sin(angle) * outerR * 0.16, 0),
        new THREE.Vector3(Math.cos(angle) * (innerR - 0.04), Math.sin(angle) * (innerR - 0.04), 0),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      g.add(new THREE.Line(geo, lineMat(color, op * 0.5)));
    }

    return g;
  }

  /* ── GEARS ───────────────────────────────────────── */
  // Main gear — large, primary blue
  const mainGear = buildGear(1.42, 0.92, 14, 0x2563eb, 0.52);
  mainGear.position.set(-0.38, 0, 0);
  scene.add(mainGear);

  // Secondary gear — smaller, cyan, meshing above main
  //   distance between centres = mainR + secR = 1.42 + 0.76 = 2.18
  const secGear = buildGear(0.76, 0.49, 8, 0x38bdf8, 0.44);
  secGear.position.set(-0.38 + 2.18, 0.04, 0);
  scene.add(secGear);

  // Gear ratio: 14/8 = 1.75  → secondary spins 1.75× faster, opposite direction
  const GEAR_RATIO = 14 / 8;
  const MAIN_SPD   = 0.0048;

  // Axis markers (thin cross at gear centres for engineering precision feel)
  function addCross(x, y, size, color) {
    const h = [new THREE.Vector3(-size, 0, 0), new THREE.Vector3(size, 0, 0)];
    const v = [new THREE.Vector3(0, -size, 0), new THREE.Vector3(0, size, 0)];
    [h, v].forEach(pts => {
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, lineMat(color, 0.25));
      line.position.set(x, y, 0);
      scene.add(line);
    });
  }
  addCross(-0.38, 0,    0.18, 0x2563eb);
  addCross(-0.38 + 2.18, 0.04, 0.12, 0x38bdf8);

  /* ── ORBITAL RINGS (AI/atomic feel) ─────────────── */
  const orbitals = [];

  function addOrbital(radius, color, tiltX, tiltY, speed, nodeCount) {
    const grp = new THREE.Group();
    grp.rotation.x = tiltX;
    grp.rotation.y = tiltY;

    // Ring
    const ringGeo = new THREE.TorusGeometry(radius, 0.009, 6, 120);
    grp.add(new THREE.Mesh(ringGeo, mat(color, 0.22)));

    // Orbiting nodes
    const nodes = [];
    for (let n = 0; n < nodeCount; n++) {
      const nodeGeo = new THREE.SphereGeometry(0.06, 10, 10);
      const nodeMesh = new THREE.Mesh(nodeGeo, mat(color, 0.9));
      grp.add(nodeMesh);
      nodes.push({ mesh: nodeMesh, phase: (n / nodeCount) * Math.PI * 2 });
    }

    scene.add(grp);
    orbitals.push({ grp, nodes, radius, speed, color });
  }

  addOrbital(2.8, 0x38bdf8, Math.PI / 3.5,  0,            0.38, 2);
  addOrbital(3.5, 0x2563eb, -Math.PI / 4,   Math.PI / 6,  0.22, 1);
  addOrbital(4.3, 0x38bdf8,  Math.PI / 7,  -Math.PI / 4,  0.14, 2);

  /* ── NEURAL NETWORK NODES ───────────────────────── */
  const NN_POSITIONS = [
    [-4.2,  1.8, -1.5], [ 4.0, -0.8, -1.2], [-2.8, -2.8,  0.8],
    [ 3.2,  2.5,  0.6], [-0.4, -4.0,  1.0], [ 0.6,  4.0, -0.5],
    [-1.2,  0.6,  4.0], [ 1.0, -0.4, -3.8],
  ];

  const nnNodes = NN_POSITIONS.map((pos, i) => {
    const geo = new THREE.SphereGeometry(0.045, 8, 8);
    const mesh = new THREE.Mesh(geo, mat(i % 2 === 0 ? 0x38bdf8 : 0x2563eb, 0.6));
    mesh.position.set(...pos);
    scene.add(mesh);
    return { mesh, phase: Math.random() * Math.PI * 2 };
  });

  // Neural connections — only between nearby nodes
  for (let i = 0; i < nnNodes.length; i++) {
    for (let j = i + 1; j < nnNodes.length; j++) {
      const dist = nnNodes[i].mesh.position.distanceTo(nnNodes[j].mesh.position);
      if (dist < 5.5) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          nnNodes[i].mesh.position.clone(),
          nnNodes[j].mesh.position.clone(),
        ]);
        scene.add(new THREE.Line(geo, lineMat(0x1e3a5f, 0.28)));
      }
    }
  }

  /* ── BACKGROUND PARTICLES ───────────────────────── */
  const PCOUNT = 280;
  const pPos   = new Float32Array(PCOUNT * 3);
  for (let i = 0; i < PCOUNT; i++) {
    const r     = 6 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x475569, size: 0.035, transparent: true, opacity: 0.65, sizeAttenuation: true,
  }));
  scene.add(particles);

  /* ── SUBTLE CONSTRUCTION LINES (blueprint feel) ── */
  const gridLines = [];
  for (let i = 0; i < 10; i++) {
    const x1 = (Math.random() - 0.5) * 14;
    const y1 = (Math.random() - 0.5) * 10;
    const x2 = x1 + (Math.random() - 0.5) * 5;
    const y2 = y1 + (Math.random() - 0.5) * 5;
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y1, -1),
      new THREE.Vector3(x2, y2, -1),
    ]);
    const line = new THREE.Line(geo, lineMat(0x1e3a5f, 0.15));
    scene.add(line);
  }

  /* ── MOUSE PARALLAX ─────────────────────────────── */
  let targetX = 0, targetY = 0, currX = 0, currY = 0;
  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 1.6;
    targetY = (e.clientY / window.innerHeight - 0.5) * 1.0;
  });

  /* ── ANIMATION LOOP ─────────────────────────────── */
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (prefersReduced) { renderer.render(scene, camera); return; }

    time += 0.01;

    // Gears
    mainGear.rotation.z += MAIN_SPD;
    secGear.rotation.z  -= MAIN_SPD * GEAR_RATIO;

    // Very slight Z-axis wobble on main gear (depth perception)
    mainGear.rotation.y = Math.sin(time * 0.15) * 0.08;
    secGear.rotation.y  = Math.sin(time * 0.15 + 0.5) * 0.06;

    // Orbital nodes travel their rings
    orbitals.forEach(o => {
      o.nodes.forEach(n => {
        const angle = time * o.speed + n.phase;
        n.mesh.position.set(Math.cos(angle) * o.radius, Math.sin(angle) * o.radius, 0);
        // Pulse opacity
        n.mesh.material.opacity = 0.6 + Math.sin(time * 2.5 + n.phase) * 0.3;
      });
    });

    // Neural nodes pulse
    nnNodes.forEach(n => {
      const s = 1 + Math.sin(time * 1.8 + n.phase) * 0.35;
      n.mesh.scale.setScalar(s);
      n.mesh.material.opacity = 0.35 + Math.sin(time * 1.8 + n.phase) * 0.3;
    });

    // Particle slow drift
    particles.rotation.y += 0.00025;

    // Mouse parallax — smooth follow
    currX += (targetX - currX) * 0.038;
    currY += (targetY - currY) * 0.038;
    camera.position.x = currX * 0.55;
    camera.position.y = -currY * 0.38;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  /* ── RESIZE ─────────────────────────────────────── */
  window.addEventListener('resize', () => {
    if (window.innerWidth < 768) { renderer.setSize(0, 0); return; }
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();
