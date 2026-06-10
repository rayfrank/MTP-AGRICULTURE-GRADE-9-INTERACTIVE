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
      pos.setZ(i, pos.getZ(i) + vels[i * 3 + 2] * delta);
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

/* ── Hay Bale Drying Scene ──────────────────────────────────── */
function mountHayScene(host, data) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(0xe8f4dc, 0.038);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0, 3.8, 7.0);
  camera.lookAt(0, 0.5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);

  createSkyDome(scene);
  scene.add(new THREE.HemisphereLight(0xf0ffe8, 0x6a7868, 1.4));
  const sun = new THREE.DirectionalLight(0xfff3c0, 2.4);
  sun.position.set(5, 9, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  // Ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), makeMat("#8ab84a", 0.9));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Shed posts + roof
  const postMat = makeMat("#6e4e22", 0.88);
  [[-2.2, 0], [2.2, 0], [-2.2, -2], [2.2, -2]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 7), postMat);
    post.position.set(px, 1.6, pz);
    post.castShadow = true;
    scene.add(post);
  });
  const roofMat = makeMat("#9e6c30", 0.85);
  [[-1.1, 0], [1.1, 0]].forEach((side) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 2.6), roofMat);
    panel.position.set(side[0], 3.18, -1.0);
    panel.rotation.z = side[0] < 0 ? 0.28 : -0.28;
    panel.castShadow = true;
    scene.add(panel);
  });

  // Sun sphere
  const sunSphere = new THREE.Mesh(new THREE.SphereGeometry(0.30, 20, 12), new THREE.MeshBasicMaterial({ color: 0xfce46a }));
  sunSphere.position.set(4.5, 5.2, -6);
  scene.add(sunSphere);

  // Dynamic group — rebuilt by update()
  let dynGroup = new THREE.Group();
  scene.add(dynGroup);

  function rebuildDynamic(d) {
    dynGroup.clear();
    const { moisture = 18, storage = "raised", weather = "hot" } = d || {};

    // Platform if raised
    if (storage === "raised") {
      const plankMat = makeMat("#8a6242", 0.9);
      for (let i = -1; i <= 1; i++) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.22), plankMat);
        plank.position.set(0, 0.05, i * 0.25);
        dynGroup.add(plank);
      }
    }

    // Hay bale (cylinder on its side)
    const baleColor = moisture > 24 ? 0x8a7240 : moisture >= 15 ? 0xd4a030 : 0xbc9028;
    const bale = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.9, 20), makeMat(baleColor, 0.78));
    bale.rotation.z = Math.PI / 2;
    bale.position.y = storage === "raised" ? 0.88 : 0.78;
    bale.castShadow = true;
    dynGroup.add(bale);

    // Binding straps
    const strapMat = makeMat("#c87c20", 0.55);
    [-0.55, 0.55].forEach((ox) => {
      const strap = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.038, 8, 32), strapMat);
      strap.rotation.y = Math.PI / 2;
      strap.position.set(ox, bale.position.y, 0);
      dynGroup.add(strap);
    });

    // Mould spots
    if (moisture > 22) {
      const mouldMat = makeMat("#3c6432", 0.8, 0.0);
      const count = moisture > 30 ? 7 : 4;
      for (let i = 0; i < count; i++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 8, 6), mouldMat);
        const angle = (i / count) * Math.PI * 2;
        s.position.set(Math.cos(angle) * 0.5, bale.position.y + 0.6 + (Math.random() - 0.5) * 0.3, Math.sin(angle) * 0.18);
        dynGroup.add(s);
      }
    }

    // Rain drops
    if (weather === "rain") {
      const dropMat = new THREE.MeshBasicMaterial({ color: 0x88bbee, transparent: true, opacity: 0.65 });
      for (let i = 0; i < 28; i++) {
        const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 4), dropMat);
        drop.position.set((Math.random() - 0.5) * 6, 1.4 + Math.random() * 2.5, (Math.random() - 0.5) * 3.5);
        drop.userData.speed = 1.8 + Math.random() * 1.2;
        dynGroup.add(drop);
      }
      dynGroup.userData.hasRain = true;
    } else {
      dynGroup.userData.hasRain = false;
    }
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(280, rect.width), h = Math.max(240, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  resize();

  rebuildDynamic(data);

  let lastTime = 0;
  renderer.setAnimationLoop((time) => {
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    sunSphere.position.y = 5.2 + Math.sin(time / 2200) * 0.2;
    if (dynGroup.userData.hasRain) {
      dynGroup.children.forEach((obj) => {
        if (obj.userData.speed) {
          obj.position.y -= obj.userData.speed * delta;
          if (obj.position.y < 0) obj.position.y = 3.8;
        }
      });
    }
    renderer.render(scene, camera);
  });

  function disposeNode(obj) {
    obj.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      const m = Array.isArray(c.material) ? c.material : [c.material];
      m.forEach((mt) => mt && mt.dispose());
    });
  }

  const ctrl = {
    update(d) { rebuildDynamic(d); },
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObs.disconnect();
      disposeNode(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    },
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── Granary Storage Scene ──────────────────────────────────── */
function mountStorageScene(host, data) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 50);
  camera.position.set(0, 3.5, 6.5);
  camera.lookAt(0, 0.5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  host.appendChild(renderer.domElement);

  // Interior lighting
  scene.add(new THREE.AmbientLight(0xffe8c0, 0.9));
  const keyLight = new THREE.DirectionalLight(0xfff0d8, 1.8);
  keyLight.position.set(2, 6, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  // Floor + walls
  const floorMat = makeMat("#b09068", 0.92);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 7), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = makeMat("#d4bfa0", 0.85);
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(8, 4.5, 0.18), wallMat);
  backWall.position.set(0, 2.25, -3.5);
  backWall.receiveShadow = true;
  scene.add(backWall);
  [[-3.9, 0], [3.9, 0]].forEach(([wx]) => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.5, 7), wallMat);
    w.position.set(wx, 2.25, 0);
    w.receiveShadow = true;
    scene.add(w);
  });

  // Dynamic group
  let dynGroup = new THREE.Group();
  scene.add(dynGroup);

  function rebuildDynamic(d) {
    dynGroup.clear();
    const score = (d && d.score != null) ? d.score : 0;

    // Grain bags stacked (2 cols × 3 rows)
    const bagMat = makeMat("#c8a860", 0.82);
    const bagPositions = [];
    for (let row = 0; row < 3; row++) {
      for (let col = -1; col <= 1; col += 2) {
        const bag = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.44, 0.58), bagMat);
        bag.position.set(col * 0.95, 0.22 + row * 0.46, -1.2);
        bag.rotation.y = (Math.random() - 0.5) * 0.12;
        bag.castShadow = true;
        bag.receiveShadow = true;
        dynGroup.add(bag);
        bagPositions.push(bag.position);
      }
    }

    // Mould if score < 80
    if (score < 80) {
      const mouldMat = makeMat("#4a7040", 0.85);
      const count = score < 40 ? 8 : 4;
      for (let i = 0; i < count; i++) {
        const bp = bagPositions[i % bagPositions.length];
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 7, 5), mouldMat);
        s.position.set(bp.x + (Math.random() - 0.5) * 0.5, bp.y + 0.24, bp.z + (Math.random() - 0.5) * 0.3);
        dynGroup.add(s);
      }
    }

    // Pests if score < 50
    if (score < 50) {
      for (let i = 0; i < 5; i++) {
        const pest = createPest((Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 2.5 - 1.2);
        dynGroup.add(pest);
      }
    }
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(280, rect.width), h = Math.max(240, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  resize();
  rebuildDynamic(data);

  renderer.setAnimationLoop(() => renderer.render(scene, camera));

  function disposeNode(obj) {
    obj.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      const m = Array.isArray(c.material) ? c.material : [c.material];
      m.forEach((mt) => mt && mt.dispose());
    });
  }

  const ctrl = {
    update(d) { rebuildDynamic(d); },
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObs.disconnect();
      disposeNode(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    },
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── Kitchen Flour Mixing Scene ─────────────────────────────── */
function mountFlourScene(host, data) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0xfaf5ee);
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 50);
  camera.position.set(0, 3.2, 5.5);
  camera.lookAt(0, 0.5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  // Warm kitchen lighting
  scene.add(new THREE.AmbientLight(0xfff8f0, 1.1));
  const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.0);
  keyLight.position.set(3, 6, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  // Counter
  const counter = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.22, 2.8), makeMat("#e0cba8", 0.78));
  counter.position.y = -0.11;
  counter.receiveShadow = true;
  scene.add(counter);

  // Flour bag (static prop)
  const bagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.8, 0.36), makeMat("#f0ead8", 0.82));
  bagMesh.position.set(-2.0, 0.51, -0.4);
  bagMesh.castShadow = true;
  scene.add(bagMesh);

  // Bowl outer shell (static)
  const bowlOut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.88, 0.55, 0.6, 32),
    makeMat("#d4c8b0", 0.55, 0.05)
  );
  bowlOut.position.set(0, 0.41, 0);
  bowlOut.castShadow = true;
  scene.add(bowlOut);

  // Bowl inner (static dark cavity)
  const bowlIn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.80, 0.48, 0.54, 32),
    makeMat("#c8bc9e", 0.7)
  );
  bowlIn.position.set(0, 0.43, 0);
  scene.add(bowlIn);

  // Flour dust particles (white)
  const dustCount = 120;
  const dustPos = new Float32Array(dustCount * 3);
  const dustSpeeds = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3]     = (Math.random() - 0.5) * 2.2;
    dustPos[i * 3 + 1] = 0.5 + Math.random() * 1.8;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    dustSpeeds[i] = 0.2 + Math.random() * 0.5;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustParticles = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xf8f4ec, size: 0.055, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dustParticles);

  // Dynamic group
  let dynGroup = new THREE.Group();
  scene.add(dynGroup);

  function rebuildDynamic(d) {
    dynGroup.clear();
    const type = (d && d.type) || "Dough";

    // Mixture inside bowl
    if (type === "Dough") {
      const doughMat = makeMat("#e8d8a0", 0.72);
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const lump = new THREE.Mesh(new THREE.SphereGeometry(0.18 + Math.random() * 0.08, 10, 7), doughMat);
        lump.position.set(Math.cos(angle) * 0.3, 0.58 + Math.random() * 0.08, Math.sin(angle) * 0.22);
        lump.scale.y = 0.65;
        dynGroup.add(lump);
      }
      // Rolling pin on counter
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 14), makeMat("#c8a878", 0.7));
      pin.rotation.z = Math.PI / 2;
      pin.position.set(1.4, 0.19, -0.2);
      pin.castShadow = true;
      dynGroup.add(pin);
      // Pin handles
      [-0.78, 0.78].forEach((ox) => {
        const h = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 10), makeMat("#9e7848", 0.75));
        h.position.set(1.4 + ox, 0.19, -0.2);
        h.rotation.z = Math.PI / 2;
        dynGroup.add(h);
      });
    } else if (type === "Thick batter") {
      // Smooth, level fill about halfway
      const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.44, 0.3, 24), makeMat("#e8d090", 0.62));
      fill.position.set(0, 0.45, 0);
      dynGroup.add(fill);
    } else {
      // Thin batter — flat, liquid-looking
      const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.48, 0.12, 24), makeMat("#f0d8a0", 0.38, 0.06));
      fill.position.set(0, 0.40, 0);
      dynGroup.add(fill);
      // Ripple ring
      const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.022, 6, 28), new THREE.MeshStandardMaterial({ color: 0xe8ca80, roughness: 0.35, transparent: true, opacity: 0.6 }));
      ripple.rotation.x = -Math.PI / 2;
      ripple.position.set(0, 0.47, 0);
      dynGroup.add(ripple);
    }
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(280, rect.width), h = Math.max(240, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  resize();
  rebuildDynamic(data);

  let lastTime2 = 0;
  renderer.setAnimationLoop((time) => {
    const delta = Math.min((time - lastTime2) / 1000, 0.05);
    lastTime2 = time;
    // Float flour dust upward
    const pos = dustParticles.geometry.attributes.position;
    for (let i = 0; i < dustCount; i++) {
      pos.setY(i, pos.getY(i) + dustSpeeds[i] * delta * 0.04);
      if (pos.getY(i) > 2.5) pos.setY(i, 0.5);
    }
    pos.needsUpdate = true;
    renderer.render(scene, camera);
  });

  function disposeNode(obj) {
    obj.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      const m = Array.isArray(c.material) ? c.material : [c.material];
      m.forEach((mt) => mt && mt.dispose());
    });
  }

  const ctrl = {
    update(d) { rebuildDynamic(d); },
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObs.disconnect();
      disposeNode(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    },
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── Farm Integration Loop Scene ────────────────────────────── */
function mountFarmLoopScene(host, data) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(0xd8f0e8, 0.04);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
  camera.position.set(0, 7.2, 5.8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  createSkyDome(scene);
  scene.add(new THREE.HemisphereLight(0xf0ffe8, 0x6a7868, 1.2));
  const sun = new THREE.DirectionalLight(0xfff3c0, 2.0);
  sun.position.set(4, 8, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), makeMat("#7fc85a", 0.88));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  addGrassBlades(scene);

  const LOOP_R = 2.8;
  const NODE_DEFS = [
    { color: 0x1e7a45 }, { color: 0x7a5e28 }, { color: 0xa05020 },
    { color: 0x8a7030 }, { color: 0x226b30 }, { color: 0x3a7a20 },
  ];
  const nodePos = NODE_DEFS.map((_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return new THREE.Vector3(Math.cos(a) * LOOP_R, 0, Math.sin(a) * LOOP_R);
  });

  const platforms = NODE_DEFS.map((nd, i) => {
    const p = nodePos[i];
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.16, 12), makeMat(nd.color, 0.72));
    plat.position.set(p.x, 0.08, p.z);
    plat.castShadow = true;
    scene.add(plat);
    return plat;
  });

  const connMat = makeMat(0x888888, 0.85);
  NODE_DEFS.forEach((_, i) => {
    const p1 = nodePos[i], p2 = nodePos[(i + 1) % 6];
    const diff = new THREE.Vector3().subVectors(p2, p1);
    const len  = diff.length();
    const conn = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, len * 0.72, 6), connMat);
    conn.position.copy(new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)).setY(0.12);
    conn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.normalize());
    scene.add(conn);
  });

  let dynGroup = new THREE.Group();
  scene.add(dynGroup);

  function rebuildDynamic(d) {
    dynGroup.clear();
    const count = d?.count ?? 0;
    platforms.forEach((plat, i) => {
      const done = i < count;
      plat.position.y = done ? 0.22 : 0.08;
      plat.material.color.set(done ? NODE_DEFS[i].color : 0x777777);
      if (done) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.048, 7, 28),
          new THREE.MeshStandardMaterial({ color: NODE_DEFS[i].color, emissive: NODE_DEFS[i].color, emissiveIntensity: 0.65, roughness: 0.3 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.set(nodePos[i].x, 0.48, nodePos[i].z);
        dynGroup.add(ring);
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 7), makeMat(NODE_DEFS[i].color, 0.45, 0.1));
        sphere.position.set(nodePos[i].x, 0.56, nodePos[i].z);
        dynGroup.add(sphere);
      }
    });
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(280, rect.width), h = Math.max(240, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  resize();
  rebuildDynamic(data);

  renderer.setAnimationLoop((time) => {
    dynGroup.rotation.y = Math.sin(time * 0.00045) * 0.12;
    renderer.render(scene, camera);
  });

  function disposeNode(obj) {
    obj.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      const m = Array.isArray(c.material) ? c.material : [c.material];
      m.forEach((mt) => mt && mt.dispose());
    });
  }
  const ctrl = {
    update(d) { rebuildDynamic(d); },
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObs.disconnect();
      disposeNode(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    },
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── Grafting Lab Scene ──────────────────────────────────────── */
function mountGraftingScene(host, data) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(0xe0f4d8, 0.055);
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 40);
  camera.position.set(0, 3.4, 5.2);
  camera.lookAt(0, 1.2, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  createSkyDome(scene);
  scene.add(new THREE.HemisphereLight(0xf0ffe8, 0x6a7868, 1.3));
  const sun = new THREE.DirectionalLight(0xfff3c0, 2.2);
  sun.position.set(3, 7, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), makeMat("#7fc85a", 0.88));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const soilMound = new THREE.Mesh(new THREE.ConeGeometry(0.82, 0.3, 12), makeMat("#8a6048", 0.92));
  soilMound.position.set(0, 0.15, 0);
  scene.add(soilMound);

  const rootstock = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.0, 10), makeMat("#7a5030", 0.85));
  rootstock.position.set(0, 1.0, 0);
  rootstock.castShadow = true;
  scene.add(rootstock);

  let dynGroup = new THREE.Group();
  scene.add(dynGroup);

  function rebuildDynamic(d) {
    dynGroup.clear();
    const count = d?.count ?? 0;

    if (count >= 1) {
      const notch = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.32), makeMat("#5a3820", 0.9));
      notch.position.set(0, 1.96, 0);
      dynGroup.add(notch);
    }
    if (count >= 3) {
      const scionColor = count >= 5 ? 0x3a7a3a : 0x8a7040;
      const scion = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.4, 10), makeMat(scionColor, 0.78));
      scion.position.set(0, 2.72, 0);
      scion.castShadow = true;
      dynGroup.add(scion);
    }
    if (count >= 4) {
      const tapeMat = makeMat(0xf4e870, 0.5, 0.05);
      for (let i = 0; i < 3; i++) {
        const tape = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.034, 6, 24), tapeMat);
        tape.position.set(0, 1.88 + i * 0.12, 0);
        dynGroup.add(tape);
      }
    }
    if (count >= 5) {
      const leafMat = makeMat(0x4a9a38, 0.82);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 6), leafMat);
        leaf.scale.set(1.6, 0.4, 0.85);
        leaf.position.set(Math.cos(a) * 0.24, 3.3 + i * 0.14, Math.sin(a) * 0.2);
        dynGroup.add(leaf);
      }
    }
    if (count >= 6) {
      const crownMat = makeMat(0x2e8c2e, 0.75);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const crown = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 6), crownMat);
        crown.position.set(Math.cos(a) * 0.36, 3.56 + Math.sin(a * 2.1) * 0.1, Math.sin(a) * 0.3);
        dynGroup.add(crown);
      }
    }
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(280, rect.width), h = Math.max(240, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  resize();
  rebuildDynamic(data);

  renderer.setAnimationLoop((time) => {
    dynGroup.rotation.y = Math.sin(time * 0.0006) * 0.18;
    renderer.render(scene, camera);
  });

  function disposeNode(obj) {
    obj.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      const m = Array.isArray(c.material) ? c.material : [c.material];
      m.forEach((mt) => mt && mt.dispose());
    });
  }
  const ctrl = {
    update(d) { rebuildDynamic(d); },
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObs.disconnect();
      disposeNode(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    },
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── Solar Dryer Scene ───────────────────────────────────────── */
function mountSunDryerScene(host, data) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(0xe8f4dc, 0.036);
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 60);
  camera.position.set(0, 3.8, 7.0);
  camera.lookAt(0, 0.6, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  host.appendChild(renderer.domElement);

  createSkyDome(scene);
  scene.add(new THREE.HemisphereLight(0xf0ffe8, 0x6a7868, 1.2));
  const sun = new THREE.DirectionalLight(0xfff3c0, 2.4);
  sun.position.set(5, 9, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), makeMat("#8ab84a", 0.88));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const sunSphere = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 12), new THREE.MeshBasicMaterial({ color: 0xfce46a }));
  sunSphere.position.set(4.8, 5.2, -5.5);
  scene.add(sunSphere);

  const legMat = makeMat(0x9a6830, 0.88);
  [[-1.8, 0.65], [1.8, 0.65], [-1.8, -0.65], [1.8, -0.65]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 1.2, 7), legMat);
    leg.position.set(lx, 0.6, lz);
    leg.castShadow = true;
    scene.add(leg);
  });

  const tray = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.1, 1.55), makeMat(0xc09040, 0.85));
  tray.position.set(0, 1.22, 0);
  tray.receiveShadow = true;
  scene.add(tray);

  const cover = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 1.7),
    new THREE.MeshPhysicalMaterial({ color: 0xd8f4ff, transparent: true, opacity: 0.35, roughness: 0.1, side: THREE.DoubleSide }));
  cover.position.set(0, 1.66, 0);
  cover.rotation.x = -0.2;
  scene.add(cover);

  let dynGroup = new THREE.Group();
  scene.add(dynGroup);

  function rebuildDynamic(d) {
    dynGroup.clear();
    const score = d?.score ?? 0;
    const vegColor = score >= 75 ? 0x3a8830 : score >= 50 ? 0x5fa048 : 0x8a9040;
    const vegMat = makeMat(vegColor, 0.82);
    [[-1.2, -0.28], [-0.5, 0.2], [0.2, -0.22], [0.9, 0.18], [1.5, -0.1]].forEach(([vx, vz]) => {
      const veg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.065, 10), vegMat);
      veg.position.set(vx, 1.3, vz);
      veg.castShadow = true;
      dynGroup.add(veg);
    });
    if (score > 30) {
      const rayCount = Math.max(2, Math.round(score / 18));
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xfce46a, transparent: true, opacity: 0.45 });
      for (let i = 0; i < rayCount; i++) {
        const a = -1.0 + i * (2.0 / Math.max(rayCount - 1, 1));
        const ray = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.6, 5), rayMat);
        ray.position.set(4.8 + Math.sin(a) * 0.5, 5.2 + Math.cos(a) * 0.5, -5.5);
        ray.rotation.z = -a + Math.PI / 2;
        ray.rotation.y = -0.45;
        dynGroup.add(ray);
      }
    }
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(280, rect.width), h = Math.max(240, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  resize();
  rebuildDynamic(data);

  renderer.setAnimationLoop((time) => {
    sunSphere.position.y = 5.2 + Math.sin(time / 2200) * 0.22;
    renderer.render(scene, camera);
  });

  function disposeNode(obj) {
    obj.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      const m = Array.isArray(c.material) ? c.material : [c.material];
      m.forEach((mt) => mt && mt.dispose());
    });
  }
  const ctrl = {
    update(d) { rebuildDynamic(d); },
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObs.disconnect();
      disposeNode(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    },
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── Cleanup / Hygiene Scene ─────────────────────────────────── */
function mountCleanupScene(host, data) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f8f4);
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 40);
  camera.position.set(0, 3.2, 5.8);
  camera.lookAt(0, 0.7, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xfff8f0, 1.1));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.0);
  key.position.set(3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), makeMat(0xc8bfa8, 0.88));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wall = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.2), makeMat(0xe8e0d4, 0.85));
  wall.position.set(0, 2.5, -3.5);
  scene.add(wall);

  // Facility models (bin / sink / drain) swapped via material colour
  const FAC_COLORS = { bin: 0x5098b8, sink: 0x609878, drain: 0x808878 };
  const binBody = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.75, 1.6, 14), makeMat(0x5098b8, 0.7));
  binBody.position.set(0, 0.8, 0);
  binBody.castShadow = true;
  scene.add(binBody);

  const binLid = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.9, 0.18, 14), makeMat(0x3a7a98, 0.65));
  binLid.position.set(0, 1.69, 0);
  binLid.castShadow = true;
  scene.add(binLid);

  let dynGroup = new THREE.Group();
  scene.add(dynGroup);

  function rebuildDynamic(d) {
    dynGroup.clear();
    const score    = d?.score    ?? 0;
    const facility = d?.facility ?? "bin";

    binBody.material.color.set(FAC_COLORS[facility] ?? 0x5098b8);

    if (score < 70) {
      const dirtMat = makeMat(0x4a3824, 0.92);
      const count = score < 30 ? 8 : 4;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.07 + Math.random() * 0.05, 7, 5), dirtMat);
        s.position.set(Math.cos(a) * (0.5 + Math.random() * 0.35), 0.55 + Math.random() * 0.9, Math.sin(a) * 0.85 * (0.5 + Math.random() * 0.3));
        dynGroup.add(s);
      }
    }
    if (score >= 80) {
      const bubMat = new THREE.MeshPhysicalMaterial({ color: 0xaae4ff, transparent: true, opacity: 0.45, roughness: 0.05 });
      for (let i = 0; i < 9; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.062 + Math.random() * 0.07, 9, 6), bubMat);
        b.position.set((Math.random() - 0.5) * 1.8, 1.68 + i * 0.2, (Math.random() - 0.5) * 0.65);
        b.userData.floatOffset = i * 0.4;
        dynGroup.add(b);
      }
      dynGroup.userData.hasBubbles = true;
    } else {
      dynGroup.userData.hasBubbles = false;
    }
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(280, rect.width), h = Math.max(240, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  resize();
  rebuildDynamic(data);

  renderer.setAnimationLoop((time) => {
    if (dynGroup.userData.hasBubbles) {
      dynGroup.children.forEach((b) => {
        b.position.y += 0.0009;
        if (b.position.y > 3.6) b.position.y = 1.68 + (b.userData.floatOffset || 0);
      });
    }
    renderer.render(scene, camera);
  });

  function disposeNode(obj) {
    obj.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      const m = Array.isArray(c.material) ? c.material : [c.material];
      m.forEach((mt) => mt && mt.dispose());
    });
  }
  const ctrl = {
    update(d) { rebuildDynamic(d); },
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObs.disconnect();
      disposeNode(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    },
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── Disinfection Match Scene ────────────────────────────────── */
function mountDisinfectScene(host, data) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0xf8f4f0);
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 40);
  camera.position.set(0, 2.8, 5.8);
  camera.lookAt(0, 1.2, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xfff8f0, 1.2));
  const key = new THREE.DirectionalLight(0xfff5e0, 1.8);
  key.position.set(3, 6, 4);
  key.castShadow = true;
  scene.add(key);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), makeMat(0xc8c0b0, 0.88));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const postMat = makeMat(0x9a8060, 0.88);
  [-2.8, 2.8].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 3.2, 7), postMat);
    post.position.set(px, 1.6, 0);
    post.castShadow = true;
    scene.add(post);
  });
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 5.7, 6), makeMat(0xc8a870, 0.8));
  rope.position.set(0, 3.22, 0);
  rope.rotation.z = Math.PI / 2;
  scene.add(rope);

  const CLOTH_COLORS = [0xf0d0c0, 0xc0d8e8, 0xe8c8d0, 0xd0e0c8, 0xe0d0c0];
  const ITEM_X = [-2.0, -1.0, 0.0, 1.0, 2.0];

  let dynGroup = new THREE.Group();
  scene.add(dynGroup);

  function rebuildDynamic(d) {
    dynGroup.clear();
    const correct = d?.correct ?? 0;
    ITEM_X.forEach((ix, i) => {
      const done = i < correct;
      const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.0, 0.065), makeMat(CLOTH_COLORS[i], 0.75));
      cloth.position.set(ix, 2.66, 0);
      cloth.castShadow = true;
      cloth.userData.sway = true;
      dynGroup.add(cloth);

      const ringMat = new THREE.MeshStandardMaterial({
        color: done ? 0x22cc66 : 0xcc2222,
        emissive: done ? 0x22cc66 : 0xcc2222,
        emissiveIntensity: 0.5, roughness: 0.4,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.042, 6, 20), ringMat);
      ring.position.set(ix, 1.9, 0.12);
      dynGroup.add(ring);

      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.18), makeMat(0xc09060, 0.8));
      pin.position.set(ix, 3.24, 0);
      dynGroup.add(pin);
    });
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(280, rect.width), h = Math.max(240, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  resize();
  rebuildDynamic(data);

  renderer.setAnimationLoop((time) => {
    dynGroup.children.forEach((c) => {
      if (c.userData.sway) c.rotation.z = Math.sin(time * 0.001 + c.position.x * 0.8) * 0.038;
    });
    renderer.render(scene, camera);
  });

  function disposeNode(obj) {
    obj.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      const m = Array.isArray(c.material) ? c.material : [c.material];
      m.forEach((mt) => mt && mt.dispose());
    });
  }
  const ctrl = {
    update(d) { rebuildDynamic(d); },
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObs.disconnect();
      disposeNode(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    },
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── Shared dispose helper ───────────────────────────────────── */
function disposeScene(scene) {
  scene.traverse(c => {
    if (c.geometry) c.geometry.dispose();
    const mats = Array.isArray(c.material) ? c.material : [c.material];
    mats.forEach(m => m && m.dispose());
  });
}

/* ── 3D Game: Pest Blaster ─────────────────────────────────── */
function mountPestBlaster3D(host) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const W = 520, H = 360, SCALE = 26;
  const CX = W / 2, CZ = H / 2;
  const toX = gx => (gx - CX) / SCALE;
  const toZ = gy => (gy - CZ) / SCALE;
  const GRAN_Z = toZ(H * 0.41);

  const scene = new THREE.Scene();
  createSkyDome(scene);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 9, 13);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);

  // Ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(38, 30), makeMat(0x4a8c3a, 0.88));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const dirt = new THREE.Mesh(new THREE.PlaneGeometry(38, 9), makeMat(0x8b6914, 0.88));
  dirt.rotation.x = -Math.PI / 2;
  dirt.position.set(0, 0.01, 5.5);
  scene.add(dirt);

  // Granary
  const granary = new THREE.Group();
  const gWalls = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 4.4), makeMat(0xd4a84b, 0.68));
  gWalls.position.y = 1.6;
  granary.add(gWalls);
  const gRoof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 2.2, 4), makeMat(0x9a6820, 0.72));
  gRoof.position.y = 4.1;
  gRoof.rotation.y = Math.PI / 4;
  granary.add(gRoof);
  const gDoor = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, 0.15), makeMat(0x6a3010, 0.78));
  gDoor.position.set(0, 1.05, 2.21);
  granary.add(gDoor);
  const winMat = new THREE.MeshStandardMaterial({ color: 0xb0d4f0, roughness: 0.2, transparent: true, opacity: 0.65 });
  [[-1.4, 2.2], [1.4, 2.2]].forEach(([wx, wy]) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.75, 0.1), winMat);
    win.position.set(wx, wy, 2.23);
    granary.add(win);
  });
  granary.position.set(0, 0, GRAN_Z);
  scene.add(granary);

  // Danger ring
  const dangerRing = new THREE.Mesh(
    new THREE.TorusGeometry(52 / SCALE, 0.07, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0xdc3c3c, opacity: 0.55, transparent: true })
  );
  dangerRing.rotation.x = Math.PI / 2;
  dangerRing.position.set(0, 0.04, GRAN_Z);
  scene.add(dangerRing);

  // Grain sacks around granary
  const sackMat = makeMat(0xe8c84a, 0.82);
  [[-2.6, 0.5], [0, 0.9], [2.6, 0.5]].forEach(([sx, sz]) => {
    const sack = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.9, 8), sackMat);
    sack.position.set(sx, 0.45, GRAN_Z + sz);
    scene.add(sack);
  });

  // Fence posts
  const postMat = makeMat(0xaa8855, 0.82);
  const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.3, 6);
  const railMat = makeMat(0xbb9966, 0.75);
  const railGeo = new THREE.BoxGeometry(3.1, 0.1, 0.1);
  for (let i = -9; i <= 9; i += 3) {
    [-7.8, 7.8].forEach(pz => {
      const p = new THREE.Mesh(postGeo, postMat); p.position.set(i, 0.65, pz); scene.add(p);
      const r = new THREE.Mesh(railGeo, railMat); r.position.set(i + 1.5, 0.8, pz); scene.add(r);
    });
  }

  // Trees
  const treeGeo = new THREE.ConeGeometry(1.1, 2.8, 7);
  const treeMat = makeMat(0x2d7a2d, 0.82);
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.1, 6);
  const trunkMat = makeMat(0x7a5030, 0.88);
  [[-10, -6], [10, -5], [-11, 2], [11, 3], [-9, 7], [9, 8]].forEach(([tx, tz]) => {
    const t = new THREE.Mesh(treeGeo, treeMat); t.position.set(tx, 2.8, tz); scene.add(t);
    const tk = new THREE.Mesh(trunkGeo, trunkMat); tk.position.set(tx, 0.55, tz); scene.add(tk);
  });

  // Lights
  scene.add(new THREE.AmbientLight(0xfff8f0, 1.2));
  const sun = new THREE.DirectionalLight(0xfff3c0, 2.0);
  sun.position.set(5, 16, 9);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xe0f0ff, 0.4);
  fill.position.set(-6, 5, -4);
  scene.add(fill);

  // Pest mesh pool
  function makeRat() {
    const g = new THREE.Group();
    const mat = makeMat(0x888888, 0.7);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 5), mat);
    body.scale.set(1.5, 0.9, 0.8); g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 5), mat);
    head.position.set(0.6, 0.08, 0); g.add(head);
    const earMat = makeMat(0xbbaaaa, 0.8);
    [0.12, -0.12].forEach(ez => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 4), earMat);
      ear.position.set(0.6, 0.38, ez); g.add(ear);
    });
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.01, 0.9, 5), makeMat(0xaaaaaa, 0.8));
    tail.rotation.z = Math.PI / 2; tail.position.set(-0.82, 0, 0); g.add(tail);
    return g;
  }
  function makeCaterpillar() {
    const g = new THREE.Group();
    const mat = makeMat(0x44aa44, 0.7);
    [0.48, 0.16, -0.16, -0.44].forEach((sx, i) => {
      const seg = new THREE.Mesh(new THREE.SphereGeometry(0.28 - i * 0.02, 7, 5), mat);
      seg.position.set(sx, 0.05, 0); g.add(seg);
    });
    const eyeMat = makeMat(0x111111, 0.9, 0);
    [0.11, -0.11].forEach(ez => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 5, 4), eyeMat);
      eye.position.set(0.64, 0.24, ez); g.add(eye);
    });
    return g;
  }
  function makeMushroom() {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 8), makeMat(0xddd0b8, 0.75));
    stem.position.y = 0.25; g.add(stem);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.48, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.58), makeMat(0xcc2211, 0.62));
    cap.position.y = 0.58; g.add(cap);
    const smat = makeMat(0xffffff, 0.5);
    [[0.3, 0.84, 0], [0.05, 0.93, 0.28], [-0.22, 0.82, 0.2]].forEach(([x, y, z]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 4, 3), smat); s.position.set(x, y, z); g.add(s);
    });
    return g;
  }

  const POOL = 10;
  const pestPool = { "🐀": [], "🐛": [], "🍄": [] };
  [["🐀", makeRat], ["🐛", makeCaterpillar], ["🍄", makeMushroom]].forEach(([emoji, fn]) => {
    for (let i = 0; i < POOL; i++) { const m = fn(); m.visible = false; scene.add(m); pestPool[emoji].push(m); }
  });

  // Particle pool
  const PCOLS = [0xffd700, 0xff6b35, 0x4ecdc4, 0x96e6a1, 0xf8b500, 0xff9ff3];
  const pGeo = new THREE.SphereGeometry(0.12, 4, 3);
  const partPool = Array.from({ length: 70 }, (_, i) => {
    const m = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: PCOLS[i % PCOLS.length], transparent: true, opacity: 1 }));
    m.visible = false; scene.add(m); return m;
  });

  // Raycaster
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hitPt = new THREE.Vector3();

  function getClickGameCoords(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const ndx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ndy = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera({ x: ndx, y: ndy }, camera);
    if (!raycaster.ray.intersectPlane(groundPlane, hitPt)) return null;
    return { x: hitPt.x * SCALE + CX, y: hitPt.z * SCALE + CZ };
  }

  function syncState({ pests = [], particles: parts = [] }) {
    const counters = { "🐀": 0, "🐛": 0, "🍄": 0 };
    Object.values(pestPool).flat().forEach(m => { m.visible = false; });
    pests.forEach(p => {
      if (p.alpha < 0.05) return;
      const pool = pestPool[p.emoji]; if (!pool) return;
      const idx = counters[p.emoji];
      if (idx >= pool.length) return;
      counters[p.emoji]++;
      const m = pool[idx];
      m.visible = true;
      const s = p.r / 14;
      m.scale.setScalar(s);
      m.position.set(toX(p.x), Math.abs(Math.sin(p.wobble)) * 0.2 * s, toZ(p.y));
      m.rotation.y = -Math.atan2(p.vx || 0, p.vy || 0);
    });
    partPool.forEach(m => { m.visible = false; });
    let pi = 0;
    parts.forEach(p => {
      if (p.txt || pi >= partPool.length) return;
      const m = partPool[pi++];
      m.visible = true;
      const frac = p.life / p.max;
      m.position.set(toX(p.x), Math.sin(frac * Math.PI) * 0.8 * (p.r / SCALE), toZ(p.y));
      m.scale.setScalar(Math.max(0.02, (p.r / SCALE) * frac));
      m.material.opacity = frac;
    });
    dangerRing.material.opacity = 0.3 + 0.25 * Math.sin(Date.now() * 0.003);
    renderer.render(scene, camera);
  }

  function resize() {
    const w = Math.max(240, host.clientWidth), h = Math.max(180, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const ctrl = {
    syncState,
    getClickGameCoords,
    dispose() {
      ro.disconnect();
      disposeScene(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    }
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── 3D Game: Farm Raider ──────────────────────────────────── */
function mountFarmRaider3D(host, resources) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const W = 520, H = 380, SCALE = 26;
  const CX = W / 2, CZ = H / 2;
  const toX = gx => (gx - CX) / SCALE;
  const toZ = gy => (gy - CZ) / SCALE;

  const scene = new THREE.Scene();
  createSkyDome(scene);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
  camera.position.set(0, 14, 11);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  // Ground + paths
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 32), makeMat(0x5a9a3a, 0.88));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const dirtMat = makeMat(0xc4a870, 0.85);
  const hPath = new THREE.Mesh(new THREE.BoxGeometry(40, 0.04, 1.8), dirtMat);
  hPath.position.y = 0.01; scene.add(hPath);
  const vPath = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 32), dirtMat);
  vPath.position.y = 0.01; scene.add(vPath);

  // Farmhouse
  const fhWall = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 3.0), makeMat(0xe8d5aa, 0.7));
  fhWall.position.set(-7, 1.25, -5.5); scene.add(fhWall);
  const fhRoof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.6, 4), makeMat(0x8b3a1a, 0.72));
  fhRoof.position.set(-7, 3.3, -5.5); fhRoof.rotation.y = Math.PI / 4; scene.add(fhRoof);

  // Resource nodes
  const nodeMeshes = {};
  resources.forEach(r => {
    const px = toX(r.x), pz = toZ(r.y);
    const col = new THREE.Color(r.color).getHex();

    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.55, 12), makeMat(0x999999, 0.7));
    base.position.set(px, 0.28, pz); scene.add(base);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 1.8, 10), makeMat(col, 0.65));
    pillar.position.set(px, 1.45, pz); scene.add(pillar);

    const top = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 7), makeMat(col, 0.5));
    top.position.set(px, 2.55, pz); scene.add(top);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.1, 8, 22),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.set(px, 0.05, pz); scene.add(ring);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 2.2, 6), makeMat(0xdddddd, 0.5));
    pole.position.set(px, 3.75, pz); pole.visible = false; scene.add(pole);

    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.06), makeMat(col, 0.6));
    flag.position.set(px + 0.45, 4.5, pz); flag.visible = false; scene.add(flag);

    nodeMeshes[r.id] = { base, pillar, top, ring, pole, flag };
  });

  // Trees
  const tGeo = new THREE.ConeGeometry(1.15, 2.9, 7), tMat = makeMat(0x2d7a2d, 0.82);
  const tkGeo = new THREE.CylinderGeometry(0.19, 0.19, 1.1, 6), tkMat = makeMat(0x7a5030, 0.88);
  [[-12, -9], [12, -9], [-13, 5], [13, 5]].forEach(([tx, tz]) => {
    const t = new THREE.Mesh(tGeo, tMat); t.position.set(tx, 2.9, tz); scene.add(t);
    const tk = new THREE.Mesh(tkGeo, tkMat); tk.position.set(tx, 0.55, tz); scene.add(tk);
  });

  // Tractor group
  const tractorGroup = new THREE.Group();
  const tBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 1.5), makeMat(0xe65100, 0.55));
  tBody.position.y = 0.72; tractorGroup.add(tBody);
  const tHood = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.65, 1.4), makeMat(0xbf360c, 0.6));
  tHood.position.set(0.9, 0.72, 0); tractorGroup.add(tHood);
  const tCab = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.9, 1.25), makeMat(0x37474f, 0.65));
  tCab.position.set(-0.3, 1.57, 0); tractorGroup.add(tCab);
  const tWind = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.72, 1.05),
    new THREE.MeshStandardMaterial({ color: 0xb0d4f0, roughness: 0.2, transparent: true, opacity: 0.6 }));
  tWind.position.set(0.17, 1.57, 0); tractorGroup.add(tWind);
  const wMat = makeMat(0x1a1a1a, 0.9);
  const rimMat = makeMat(0x888888, 0.4, 0.4);
  const rearWGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.42, 14);
  const frontWGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 12);
  const wheelMeshes = [];
  [[-0.75, 0.55, 0.88], [-0.75, 0.55, -0.88]].forEach(([wx, wy, wz]) => {
    const w = new THREE.Mesh(rearWGeo, wMat); w.rotation.z = Math.PI / 2; w.position.set(wx, wy, wz); tractorGroup.add(w); wheelMeshes.push(w);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.44, 8), rimMat); rim.rotation.z = Math.PI / 2; rim.position.set(wx, wy, wz); tractorGroup.add(rim);
  });
  [[0.82, 0.36, 0.78], [0.82, 0.36, -0.78]].forEach(([wx, wy, wz]) => {
    const w = new THREE.Mesh(frontWGeo, wMat); w.rotation.z = Math.PI / 2; w.position.set(wx, wy, wz); tractorGroup.add(w); wheelMeshes.push(w);
  });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.9, 6), makeMat(0x424242, 0.75));
  pipe.position.set(0.9, 1.44, 0.52); tractorGroup.add(pipe);
  tractorGroup.position.set(0, 0, 0);
  scene.add(tractorGroup);

  // Particle pool
  const PCOLS = [0xffd700, 0xff8844, 0x44cccc, 0xaaddaa, 0xffcc00, 0xff88ee];
  const ptGeo = new THREE.SphereGeometry(0.1, 4, 3);
  const partPool = Array.from({ length: 60 }, (_, i) => {
    const m = new THREE.Mesh(ptGeo, new THREE.MeshBasicMaterial({ color: PCOLS[i % PCOLS.length], transparent: true, opacity: 1 }));
    m.visible = false; scene.add(m); return m;
  });

  // Lights
  scene.add(new THREE.AmbientLight(0xfff8f0, 1.2));
  const sun = new THREE.DirectionalLight(0xfff3c0, 1.8);
  sun.position.set(6, 16, 8); scene.add(sun);

  // Raycaster
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hitPt = new THREE.Vector3();

  function getClickGameCoords(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const ndx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ndy = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera({ x: ndx, y: ndy }, camera);
    if (!raycaster.ray.intersectPlane(groundPlane, hitPt)) return null;
    return { x: hitPt.x * SCALE + CX, y: hitPt.z * SCALE + CZ };
  }

  let _lastSync = Date.now();
  function syncState({ player, collected, particles: parts = [] }) {
    const now = Date.now();
    const dt = Math.min((now - _lastSync) / 1000, 0.05);
    _lastSync = now;

    tractorGroup.position.set(toX(player.x), 0, toZ(player.y));
    tractorGroup.rotation.y = -player.angle + Math.PI / 2;
    const spd3D = Math.hypot(player.vx || 0, player.vy || 0) / SCALE;
    wheelMeshes.forEach(w => { w.rotation.x += spd3D * 1.8 * dt; });

    resources.forEach(r => {
      const done = collected.has(r.id);
      const n = nodeMeshes[r.id]; if (!n) return;
      const col = new THREE.Color(r.color).getHex();
      n.pillar.material.color.setHex(done ? col : 0x999999);
      n.pillar.material.emissive.setHex(done ? new THREE.Color(r.color).multiplyScalar(0.2).getHex() : 0x000000);
      n.top.material.color.setHex(done ? col : 0xaaaaaa);
      n.ring.visible = !done;
      n.pole.visible = done;
      n.flag.visible = done;
    });

    partPool.forEach(m => { m.visible = false; });
    let pi = 0;
    parts.forEach(p => {
      if (pi >= partPool.length) return;
      const m = partPool[pi++];
      m.visible = true;
      const frac = p.life / p.max;
      m.position.set(toX(p.x), 0.15 + (1 - frac) * 1.5, toZ(p.y));
      m.scale.setScalar(Math.max(0.02, (p.r / SCALE) * frac));
      m.material.opacity = frac * 0.85;
    });

    renderer.render(scene, camera);
  }

  function resize() {
    const w = Math.max(240, host.clientWidth), h = Math.max(180, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const ctrl = {
    syncState,
    getClickGameCoords,
    dispose() {
      ro.disconnect();
      disposeScene(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    }
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── 3D Game: Flour Frenzy Factory ────────────────────────── */
function mountFlourFrenzy3D(host, products) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const W = 520, SCALE = 26;
  const BELT_Y = 2.3;
  const toX = gx => (gx - W / 2) / SCALE;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x7a94a8);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 60);
  camera.position.set(0, 5.5, 14);
  camera.lookAt(0, 2.5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);

  // Factory wall
  const wall = new THREE.Mesh(new THREE.BoxGeometry(32, 13, 0.5), makeMat(0x607d8b, 0.9));
  wall.position.set(0, 4.5, -0.9); scene.add(wall);

  // Windows
  [[-6, 5.5], [0, 5.5], [6, 5.5]].forEach(([wx, wy]) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 0.2), makeMat(0x546e7a, 0.8));
    frame.position.set(wx, wy, -0.6); scene.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xb0d4f0, roughness: 0.2, transparent: true, opacity: 0.65 }));
    glass.position.set(wx, wy, -0.52); scene.add(glass);
  });

  // Chimney + smoke
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.0, 4.8, 1.0), makeMat(0x455a64, 0.85));
  chimney.position.set(7.5, 7.8, -0.7); scene.add(chimney);
  const smokePuffs = [];
  for (let i = 0; i < 4; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.45 + i * 0.18, 7, 5),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9, transparent: true, opacity: 0.3 - i * 0.05 }));
    puff.position.set(7.5, 10.2 + i * 0.65, -0.7);
    puff.userData.baseY = puff.position.y;
    puff.userData.phase = i * 0.85;
    scene.add(puff); smokePuffs.push(puff);
  }

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(32, 14), makeMat(0x8d6e4a, 0.88));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.5; scene.add(floor);

  // Belt
  const beltMat = makeMat(0x424242, 0.6);
  const beltTop = new THREE.Mesh(new THREE.BoxGeometry(22, 0.22, 1.5), beltMat);
  beltTop.position.set(0, BELT_Y + 0.11, 0); scene.add(beltTop);
  const beltBot = new THREE.Mesh(new THREE.BoxGeometry(22, 0.18, 1.5), beltMat);
  beltBot.position.set(0, BELT_Y - 0.7, 0); scene.add(beltBot);
  const beltEndGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.5, 12);
  [[-10.5], [10.5]].forEach(([bx]) => {
    const be = new THREE.Mesh(beltEndGeo, makeMat(0x383838, 0.6));
    be.rotation.z = Math.PI / 2; be.position.set(bx, BELT_Y, 0); scene.add(be);
  });
  // Belt stripes
  const stripeMat = makeMat(0x555555, 0.5);
  for (let x = -10; x <= 10; x += 2.2) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, 1.52), stripeMat);
    stripe.position.set(x, BELT_Y + 0.12, 0); scene.add(stripe);
  }
  // Legs
  const legGeo = new THREE.CylinderGeometry(0.14, 0.14, 2.8, 6);
  const legMat = makeMat(0x303030, 0.7);
  [-8, -4, 0, 4, 8].forEach(bx => {
    const leg = new THREE.Mesh(legGeo, legMat); leg.position.set(bx, 0.9, 0); scene.add(leg);
  });

  // Product box pool with canvas textures for faces
  function makeProductTex(p) {
    const c = document.createElement("canvas"); c.width = 128; c.height = 128;
    const x = c.getContext("2d");
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, 128, 128);
    x.font = "58px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText(p.emoji, 64, 52);
    x.font = "bold 18px sans-serif"; x.fillStyle = "#333";
    x.fillText(p.label, 64, 102);
    return new THREE.CanvasTexture(c);
  }
  const prodTextures = (products || []).map(p => makeProductTex(p));

  const BOX_GEO = new THREE.BoxGeometry(1.45, 1.45, 1.45);
  const neutralCol = 0xf5f0e8, correctCol = 0x2ea85a, wrongCol = 0xe53935;
  const boxPool = Array.from({ length: 20 }, () => {
    const mats = Array.from({ length: 6 }, (_, fi) =>
      fi === 4
        ? new THREE.MeshStandardMaterial({ roughness: 0.5 })
        : new THREE.MeshStandardMaterial({ color: neutralCol, roughness: 0.65 })
    );
    const m = new THREE.Mesh(BOX_GEO, mats);
    m.visible = false; scene.add(m); return m;
  });

  // Lights
  scene.add(new THREE.AmbientLight(0xffe0c0, 1.1));
  const fl = new THREE.DirectionalLight(0xfff8f0, 1.8);
  fl.position.set(2, 12, 10); scene.add(fl);

  function syncState({ items = [] }) {
    const t = Date.now() * 0.001;
    // Animate smoke
    smokePuffs.forEach(p => {
      p.position.y = p.userData.baseY + ((t * 0.18 + p.userData.phase * 0.5) % 2.2);
      p.material.opacity = Math.max(0, (0.28 - p.userData.phase * 0.04) * (0.5 + 0.5 * Math.sin(t * 1.2 + p.userData.phase)));
    });

    // Update box pool
    boxPool.forEach(b => { b.visible = false; });
    let bi = 0;
    items.forEach(item => {
      if (item.x < -55 || bi >= boxPool.length) return;
      const mesh = boxPool[bi++];
      mesh.visible = true;
      const x3 = toX(item.x);
      mesh.position.set(
        item.shakeT > 0 ? x3 + Math.sin(item.shakeT * 18) * 0.18 : x3,
        BELT_Y + 0.95,
        0
      );
      mesh.rotation.y = Math.sin(t * 0.8 + bi) * 0.08;

      const col = item.answered === "correct" ? correctCol : item.answered === "wrong" ? wrongCol : neutralCol;
      for (let fi = 0; fi < 6; fi++) {
        if (fi === 4) {
          const prodIdx = (products || []).findIndex(p => p.emoji === item.emoji);
          const tex = prodIdx >= 0 ? prodTextures[prodIdx] : null;
          if (mesh.material[fi].map !== tex) { mesh.material[fi].map = tex; mesh.material[fi].needsUpdate = true; }
          mesh.material[fi].color.setHex(col);
        } else {
          mesh.material[fi].color.setHex(col);
        }
      }
    });

    renderer.render(scene, camera);
  }

  function resize() {
    const w = Math.max(240, host.clientWidth), h = Math.max(180, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const ctrl = {
    syncState,
    dispose() {
      prodTextures.forEach(t => t.dispose());
      ro.disconnect();
      disposeScene(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    }
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── 3D Scene: Leftover Sort Kitchen ──────────────────────── */
function mountLeftoverSortScene(host) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0e8dc);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 40);
  camera.position.set(0, 5.5, 10);
  camera.lookAt(0, 1.8, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);

  // Back wall
  const bwall = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 0.3), makeMat(0xe8dcc8, 0.88));
  bwall.position.set(0, 3, -2.2);
  scene.add(bwall);
  // Counter top
  const cTop = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 4), makeMat(0xd4b896, 0.68));
  cTop.position.set(0, 1.6, 0);
  scene.add(cTop);
  // Counter base
  const cBase = new THREE.Mesh(new THREE.BoxGeometry(16, 3.0, 3.6), makeMat(0xb08060, 0.82));
  cBase.position.set(0, 0.1, 0.1);
  scene.add(cBase);

  // Four zone containers on counter
  const ZONE_COLORS = [0x1e7a45, 0x1565c0, 0xe65100, 0xc62828];
  [-5.5, -1.7, 2.1, 5.9].forEach((cx, i) => {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.88, 1.6, 10), makeMat(ZONE_COLORS[i], 0.6));
    body.position.set(cx, 2.68, 0.3);
    scene.add(body);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.2, 10), makeMat(ZONE_COLORS[i], 0.4, 0.2));
    lid.position.set(cx, 3.58, 0.3);
    scene.add(lid);
  });
  // Bowl and plate decoration
  const bowlGeo = new THREE.SphereGeometry(0.58, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
  [-3.8, 4.4].forEach(bx => {
    const b = new THREE.Mesh(bowlGeo, makeMat(0xffffff, 0.3, 0.1));
    b.position.set(bx, 1.96, -0.5);
    scene.add(b);
  });

  scene.add(new THREE.AmbientLight(0xfff5ea, 1.3));
  const oh = new THREE.DirectionalLight(0xfff8f0, 1.8);
  oh.position.set(0, 9, 6);
  scene.add(oh);

  function resize() {
    const w = Math.max(200, host.clientWidth), h = Math.max(160, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  let _t = 0;
  renderer.setAnimationLoop((ts) => {
    _t = ts * 0.0003;
    camera.position.x = Math.sin(_t * 0.5) * 0.6;
    camera.lookAt(0, 1.8, 0);
    renderer.render(scene, camera);
  });
  const ctrl = {
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      disposeScene(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    }
  };
  mounted.set(host, ctrl);
  return ctrl;
}

/* ── 3D Scene: Word Search Nature ─────────────────────────── */
function mountWordSearchScene(host) {
  if (!host) return null;
  if (mounted.has(host)) mounted.get(host).dispose();
  host.replaceChildren();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe8f5e9);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 40);
  camera.position.set(0, 3.5, 9);
  camera.lookAt(0, 1.5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(22, 16), makeMat(0x5a8a3a, 0.88));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Small crop plants
  const coneGeo = new THREE.ConeGeometry(0.72, 1.6, 6);
  const coneMat = makeMat(0x2d7a2d, 0.82);
  const trunkGeo2 = new THREE.CylinderGeometry(0.11, 0.13, 0.6, 6);
  const trunkMat2 = makeMat(0x7a5030, 0.88);
  [[-6, -2.5], [0, -4], [6, -2.5], [-3.5, 0.5], [3.5, 0.5], [-7, 2.5], [7, 2.5]].forEach(([tx, tz]) => {
    const t = new THREE.Mesh(coneGeo, coneMat); t.position.set(tx, 1.4, tz); scene.add(t);
    const tk = new THREE.Mesh(trunkGeo2, trunkMat2); tk.position.set(tx, 0.3, tz); scene.add(tk);
  });

  // Open book on ground
  const pageMat = makeMat(0xf5e8c8, 0.6);
  [[-1.35, 0.12], [1.35, -0.12]].forEach(([bx, rot]) => {
    const page = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 3.4), pageMat);
    page.position.set(bx, 0.06, 1.8); page.rotation.y = rot;
    scene.add(page);
  });
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 3.4), makeMat(0x5a3a1a, 0.7));
  spine.position.set(0, 0.06, 1.8);
  scene.add(spine);
  // Lines on pages
  const lineMat = makeMat(0xbbbbbb, 0.9);
  const lineGeo = new THREE.BoxGeometry(2.0, 0.02, 0.09);
  for (let row = 0; row < 5; row++) {
    [[-1.3, 0.0], [1.3, 0.0]].forEach(([lx]) => {
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(lx, 0.12, 0.6 + row * 0.5);
      scene.add(line);
    });
  }

  // Floating letter cubes above the book
  const LETTER_COLORS = [0x1e7a45, 0x1565c0, 0xe65100, 0xf9a825, 0x9c27b0];
  const letterGroup = new THREE.Group();
  const cubeGeo = new THREE.BoxGeometry(0.42, 0.42, 0.09);
  for (let i = 0; i < 9; i++) {
    const cube = new THREE.Mesh(cubeGeo, makeMat(LETTER_COLORS[i % LETTER_COLORS.length], 0.55));
    cube.position.set((Math.random() - 0.5) * 9, 0.8 + Math.random() * 1.4, (Math.random() - 0.5) * 4 + 1.5);
    cube.userData.floatOffset = Math.random() * Math.PI * 2;
    cube.userData.rotSpd = (Math.random() - 0.5) * 0.025;
    letterGroup.add(cube);
  }
  scene.add(letterGroup);

  scene.add(new THREE.AmbientLight(0xfff5ea, 1.3));
  const sun2 = new THREE.DirectionalLight(0xfff3c0, 1.7);
  sun2.position.set(4, 10, 6);
  scene.add(sun2);

  function resize() {
    const w = Math.max(200, host.clientWidth), h = Math.max(150, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  renderer.setAnimationLoop((ts) => {
    const t = ts * 0.001;
    letterGroup.children.forEach(c => {
      c.position.y = 0.8 + Math.sin(t + c.userData.floatOffset) * 0.28;
      c.rotation.y += c.userData.rotSpd;
    });
    renderer.render(scene, camera);
  });
  const ctrl = {
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      disposeScene(scene);
      renderer.dispose();
      host.replaceChildren();
      mounted.delete(host);
    }
  };
  mounted.set(host, ctrl);
  return ctrl;
}

function disposeAll() {
  [...mounted.values()].forEach((c) => c.dispose());
}

window.MTPThreeSim = {
  mountGarden,
  mountHayScene, mountStorageScene, mountFlourScene,
  mountFarmLoopScene, mountGraftingScene, mountSunDryerScene,
  mountCleanupScene, mountDisinfectScene,
  mountPestBlaster3D, mountFarmRaider3D, mountFlourFrenzy3D,
  mountLeftoverSortScene, mountWordSearchScene,
  disposeAll,
};
window.dispatchEvent(new CustomEvent("mtp-three-ready"));
})();
