(() => {
const THREE = window.THREE;
if (!THREE) { console.error("Three.js did not load."); return; }

const mounted = new Map();

/* ── Geometry / material helpers ────────────────────────────── */
function makeMat(color, rough = 0.6, metal = 0.1) {
  // Upgraded to MeshPhysicalMaterial for more realistic PBR (glass/liquid feel)
  return new THREE.MeshPhysicalMaterial({ 
    color, 
    roughness: rough, 
    metalness: metal,
    clearcoat: 0.2,
    clearcoatRoughness: 0.1
  });
}

function makeLeaf(root, x, y, z, scale, color, rot) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 8),
    makeMat(color, 0.80),
  );
  m.scale.set(scale * 1.55, scale * 0.40, scale * 0.78);
  m.position.set(x, y, z);
  m.rotation.set(0.22, rot, 0.18);
  root.add(m);
}

/* ── Sky dome ────────────────────────────────────────────────── */
function createSkyDome(scene) {
  const geo = new THREE.SphereGeometry(18, 32, 16);
  // Vertex-colour sky gradient
  const colors = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.max(0, Math.min(1, (y + 18) / 36));
    // Horizon (warm) → zenith (blue)
    const r = 0.58 + (1 - t) * 0.32;
    const g = 0.82 + (1 - t) * 0.08;
    const b = 0.96 - t * 0.25;
    colors.push(r, g, b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide });
  const dome = new THREE.Mesh(geo, mat);
  scene.add(dome);
  return dome;
}

/* ── Pollen/dust particles ──────────────────────────────────── */
function createParticles(scene) {
  const count = 180;
  const positions = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);
  const speeds    = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 9;
    sizes[i]  = 0.04 + Math.random() * 0.06;
    speeds[i] = 0.3 + Math.random() * 0.8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xf6e47a,
    size: 0.06,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const particles = new THREE.Points(geo, mat);
  particles.userData.positions = positions;
  particles.userData.speeds    = speeds;
  scene.add(particles);
  return particles;
}

/* ── Water Particle System ──────────────────────────────────── */
function createWaterSplash(scene, x, y, z) {
  const count = 30;
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    velocities.push(
      (Math.random() - 0.5) * 2,
      Math.random() * 3 + 2,
      (Math.random() - 0.5) * 2
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x88ccff, size: 0.08, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
  });
  const splash = new THREE.Points(geo, mat);
  splash.userData = { velocities, age: 0 };
  scene.add(splash);
  return splash;
}

function updateWaterSplashes(splashes, scene, delta) {
  for (let j = splashes.length - 1; j >= 0; j--) {
    const splash = splashes[j];
    splash.userData.age += delta;
    if (splash.userData.age > 0.8) {
      scene.remove(splash);
      splash.geometry.dispose();
      splash.material.dispose();
      splashes.splice(j, 1);
      continue;
    }
    const pos = splash.geometry.attributes.position;
    const vels = splash.userData.velocities;
    for (let i = 0; i < pos.count; i++) {
      vels[i * 3 + 1] -= 9.8 * delta; // gravity
      pos.setX(i, pos.getX(i) + vels[i * 3] * delta);
      pos.setY(i, pos.getY(i) + vels[i * 3 + 1] * delta);
      pos.setZ(i, pos.Z = pos.getZ(i) + vels[i * 3 + 2] * delta);
    }
    pos.needsUpdate = true;
    splash.material.opacity = 1 - (splash.userData.age / 0.8);
  }
}

function updateParticles(particles, delta) {
  const pos = particles.geometry.attributes.position;
  const speeds = particles.userData.speeds;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, pos.getY(i) + speeds[i] * delta * 0.04);
    if (pos.getY(i) > 4.5) pos.setY(i, 0.1);
    pos.setX(i, pos.getX(i) + Math.sin(Date.now() * 0.0004 + i) * 0.001);
  }
  pos.needsUpdate = true;
}

/* ── Grass blades ────────────────────────────────────────────── */
function addGrassBlades(scene) {
  const bladeGeo = new THREE.ConeGeometry(0.025, 0.22, 4);
  const bladeMat = makeMat("#6ab846", 0.95);
  const rows = 10, cols = 14;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Skip grid area so blades don't occlude garden beds
      const gx = (c / cols - 0.5) * 10;
      const gz = (r / rows - 0.5) * 8.5;
      if (Math.abs(gx) < 3.5 && Math.abs(gz) < 2.5) continue;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(gx + (Math.random() - 0.5) * 0.6, 0.11, gz + (Math.random() - 0.5) * 0.6);
      blade.rotation.y = Math.random() * Math.PI * 2;
      blade.rotation.z = (Math.random() - 0.5) * 0.25;
      scene.add(blade);
    }
  }
}

/* ── Plant builder ──────────────────────────────────────────── */
function createPlant(plot, crop, time) {
  const root = new THREE.Group();
  const stage = Math.max(1, plot.stage);
  const stemH = 0.30 + stage * 0.26;

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.054, stemH, 10),
    makeMat(crop.color, 0.82),
  );
  stem.position.y = stemH / 2;
  stem.castShadow = true;
  root.add(stem);

  // Gentle sway animation
  root.rotation.z = Math.sin(time * 1.6 + stage) * 0.07;
  root.rotation.x = Math.sin(time * 0.9 + stage * 0.7) * 0.03;

  for (let i = 0; i < stage + 2; i++) {
    const y    = 0.20 + i * 0.18;
    const side = i % 2 === 0 ? -1 : 1;
    const sc   = 0.50 + stage * 0.09;
    makeLeaf(root, side * 0.18, y, 0.02, sc, crop.color, side * 0.82);
  }

  if (stage >= 4) {
    // Ripe fruit
    const fruit = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 14, 10),
      makeMat("#f0c64f", 0.42, 0.06),
    );
    fruit.position.set(0.16, stemH + 0.08, 0.02);
    fruit.castShadow = true;
    root.add(fruit);
    // Bounce at full ripeness
    root.scale.y = 1 + Math.sin(time * 2.8) * 0.025;
  }

  return root;
}

/* ── Weed and pest helpers ─────────────────────────────────── */
function createWeed(x, z, h = 0.26) {
  const g = new THREE.Group();
  const m = makeMat("#6c8b48", 0.92);
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.032, h, 5), m);
    blade.position.set(x + (i - 1) * 0.06, h / 2, z);
    blade.rotation.z = (i - 1) * 0.28;
    g.add(blade);
  }
  return g;
}

function createPest(x, z) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.058, 10, 7),
    makeMat("#c23d44", 0.58),
  );
  m.position.set(x, 0.22, z);
  return m;
}

function createMulch(index) {
  const s = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.032, 0.042),
    makeMat("#d8b15a", 0.92),
  );
  s.position.set(0, 0.07, -0.30 + index * 0.20);
  s.rotation.y = index % 2 ? 0.22 : -0.22;
  return s;
}

/* ── Plot soil color ─────────────────────────────────────────── */
function plotColor(plot) {
  const w = plot.water / 100;
  const f = plot.fertility / 100;
  const r = Math.round(100 + f * 34 - w * 14);
  const g = Math.round(66  + f * 30 + w * 20);
  const b = Math.round(40  + w * 28);
  return new THREE.Color(`rgb(${r},${g},${b})`);
}

/* ── Main garden scene ──────────────────────────────────────── */
function mountGarden(host, garden, crops, onPlot) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene    = new THREE.Scene();
  scene.fog      = new THREE.FogExp2(0xd8f0e8, 0.045);

  const camera   = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
  camera.position.set(0, 6.5, 8.8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  host.appendChild(renderer.domElement);

  // Sky dome
  createSkyDome(scene);

  // Ambient light
  const ambient = new THREE.HemisphereLight(0xf0ffe8, 0x6a7868, 1.65);
  scene.add(ambient);

  // Key sun light
  const sunLight = new THREE.DirectionalLight(0xfff4d8, 2.60);
  sunLight.position.set(4.2, 8, 5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far  = 30;
  sunLight.shadow.camera.left = -8;
  sunLight.shadow.camera.right = 8;
  sunLight.shadow.camera.top  = 8;
  sunLight.shadow.camera.bottom = -8;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Rim / fill light
  const fillLight = new THREE.DirectionalLight(0xa8d8f0, 0.60);
  fillLight.position.set(-4, 3, -4);
  scene.add(fillLight);

  // Ground plane
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 10),
    makeMat("#7fc85a", 0.88),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grass blades around the beds
  addGrassBlades(scene);

  // Sun sphere
  const sunSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xfce46a }),
  );
  sunSphere.position.set(4.2, 4.8, -3.5);
  scene.add(sunSphere);

  // Clouds
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.92, transparent: true, opacity: 0.78,
  });
  const clouds = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(
      new THREE.SphereGeometry(0.24 + i * 0.03, 14, 7),
      cloudMat,
    );
    c.scale.set(1.55, 0.42, 0.72);
    c.position.set(-1.2 + i * 0.40, 4.0 + Math.sin(i * 1.3) * 0.10, -4.2);
    clouds.add(c);
  }
  scene.add(clouds);

  // Particles (pollen)
  const particles = createParticles(scene);
  const splashes = [];

  // MTP Logo Billboard
  const texLoader = new THREE.TextureLoader();
  texLoader.load("mtplogo.png", (tex) => {
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.85 });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3, 3, 1);
    sprite.position.set(-6, 4, -8);
    scene.add(sprite);
  });

  // Garden beds
  const raycaster  = new THREE.Raycaster();
  const pointer    = new THREE.Vector2();
  const plotGroups = [];
  const clickable  = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const index = row * 4 + col;
      const group = new THREE.Group();
      group.position.set((col - 1.5) * 1.80, 0, (row - 1) * 1.62);
      group.userData.index = index;

      // Bed box
      const bed = new THREE.Mesh(
        new THREE.BoxGeometry(1.46, 0.24, 1.20),
        makeMat("#8a6241", 0.94),
      );
      bed.position.y = 0.09;
      bed.castShadow  = true;
      bed.receiveShadow = true;
      bed.userData.index = index;
      group.add(bed);
      clickable.push(bed);

      // Rim (wooden border)
      const rim = new THREE.Mesh(
        new THREE.BoxGeometry(1.56, 0.08, 1.30),
        makeMat("#7a5832", 0.90),
      );
      rim.position.y = 0.22;
      rim.receiveShadow = true;
      group.add(rim);

      // Corner posts
      [[-0.72, 0.58], [0.72, 0.58], [-0.72, -0.58], [0.72, -0.58]].forEach(([px, pz]) => {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.032, 0.032, 0.32, 6),
          makeMat("#5a3e20", 0.88),
        );
        post.position.set(px, 0.37, pz);
        group.add(post);
      });

      const cropRoot = new THREE.Group();
      cropRoot.position.y = 0.24;
      group.add(cropRoot);
      group.userData.bed      = bed;
      group.userData.cropRoot = cropRoot;

      scene.add(group);
      plotGroups.push(group);
    }
  }

  // Hover highlight
  let hovered = -1;
  const highlightMat = new THREE.MeshStandardMaterial({
    color: 0x5ec880, roughness: 0.5, transparent: true, opacity: 0.35,
  });

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(320, rect.width);
    const h = Math.max(280, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  resize();

  function update(nextGarden = garden, nextCrops = crops) {
    const t = performance.now() / 1000;
    plotGroups.forEach((group, index) => {
      const plot     = nextGarden.plots[index];
      const bed      = group.userData.bed;
      const cropRoot = group.userData.cropRoot;

      // Soil color from water/fertility
      bed.material.color.copy(plotColor(plot));

      // Hover highlight overlay (simple scale bounce)
      group.scale.setScalar(index === hovered ? 1.03 : 1);

      // Rebuild crop content
      cropRoot.clear();

      if (plot.mulch) {
        for (let i = 0; i < 4; i++) cropRoot.add(createMulch(i));
      }
      if (plot.crop) {
        const plant = createPlant(plot, nextCrops[plot.crop], t);
        cropRoot.add(plant);
      }

      const weedCount = Math.min(5, Math.floor(plot.weeds / 18));
      for (let i = 0; i < weedCount; i++) {
        cropRoot.add(createWeed(-0.50 + i * 0.25, 0.38 - (i % 2) * 0.34));
      }

      const pestCount = Math.min(5, Math.floor(plot.pests / 20));
      for (let i = 0; i < pestCount; i++) {
        cropRoot.add(createPest(-0.38 + i * 0.19, -0.34 + (i % 2) * 0.28));
      }
    });
  }

  function onPointerMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
    pointer.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(clickable, false)[0];
    hovered = hit ? hit.object.userData.index : -1;
    renderer.domElement.style.cursor = hovered >= 0 ? "pointer" : "default";
  }

  function onPointerDown(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
    pointer.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(clickable, false)[0];
    if (hit) {
      const idx = hit.object.userData.index;
      // Spawn water splash
      splashes.push(createWaterSplash(scene, hit.point.x, hit.point.y, hit.point.z));
      if (typeof onPlot === "function") onPlot(idx);
    }
  }

  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerdown",  onPointerDown);

  let lastTime = 0;
  function animate(time) {
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    // Animate environment
    clouds.position.x = Math.sin(time / 3800) * 1.0;
    sunSphere.position.y = 4.8 + Math.sin(time / 2400) * 0.18;
    sunLight.position.x  = 4.2 + Math.sin(time / 2800) * 0.70;

    // Update pollen particles and water splashes
    updateParticles(particles, delta * 60);
    updateWaterSplashes(splashes, scene, delta);

    update(garden, crops);
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
  update(garden, crops);

  function disposeNode(obj) {
    obj.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => m && m.dispose());
    });
  }

  const controller = {
    update,
    dispose() {
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown",  onPointerDown);
      resizeObs.disconnect();
      disposeNode(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    },
  };
  mounted.set(host, controller);
  return controller;
}

function disposeAll() {
  [...mounted.values()].forEach((c) => c.dispose());
}

window.MTPThreeSim = { mountGarden, disposeAll };
window.dispatchEvent(new CustomEvent("mtp-three-ready"));
})();
