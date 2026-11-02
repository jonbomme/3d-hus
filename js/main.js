import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const app = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b8e0);
scene.fog = new THREE.Fog(0x87b8e0, 55, 120);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);
camera.position.set(-14, 4.2, 17);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2 - 0.04;
controls.minDistance = 5;
controls.maxDistance = 60;

const hemi = new THREE.HemisphereLight(0xcfe4ff, 0x55804a, 0.5);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff1da, 3.2);
sun.position.set(18, 22, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.left = -25;
sun.shadow.camera.right = 25;
sun.shadow.camera.top = 25;
sun.shadow.camera.bottom = -25;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 80;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun);

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function brickTexture() {
  const [canvas, ctx] = makeCanvas(512, 256);
  ctx.fillStyle = '#b8aca0';
  ctx.fillRect(0, 0, 512, 256);
  const bh = 20;
  const bw = 56;
  const gap = 4;
  let row = 0;
  for (let y = 0; y < 256; y += bh + gap, row++) {
    const offset = row % 2 ? (bw + gap) / 2 : 0;
    for (let x = -offset; x < 512; x += bw + gap) {
      const r = 140 + Math.random() * 70;
      const g = 48 + Math.random() * 30;
      const b = 36 + Math.random() * 24;
      ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
      ctx.fillRect(x + gap / 2, y + gap / 2, bw - gap, bh - gap);
      for (let i = 0; i < 40; i++) {
        const px = x + gap / 2 + Math.random() * (bw - gap);
        const py = y + gap / 2 + Math.random() * (bh - gap);
        ctx.fillStyle = `rgba(${r + 40},${g + 40},${b + 40},${Math.random() * 0.08})`;
        ctx.fillRect(px, py, 2 + Math.random() * 4, 1 + Math.random() * 2);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function roofTexture() {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#2e3238';
  ctx.fillRect(0, 0, 512, 512);
  const th = 26;
  const tw = 60;
  let row = 0;
  for (let y = 0; y < 512; y += th * 0.55, row++) {
    const offset = row % 2 ? tw / 2 : 0;
    for (let x = -offset; x < 512; x += tw) {
      const v = 38 + Math.random() * 22;
      ctx.fillStyle = `rgb(${v | 0},${v + 3 | 0},${v + 7 | 0})`;
      ctx.fillRect(x + 1, y + 1, tw - 2, th * 0.55 - 1);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(x + 1, y + th * 0.55 - 3, tw - 2, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x + 1, y + 1, tw - 2, 4);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function grassTexture() {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#5d8f3e';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26000; i++) {
    const g = 110 + Math.random() * 80;
    const r = 50 + Math.random() * 45;
    ctx.fillStyle = `rgba(${r | 0},${g | 0},${35 + Math.random() * 25 | 0},0.5)`;
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 2 + Math.random() * 4);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(30, 30);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function plankTexture() {
  const [canvas, ctx] = makeCanvas(512, 256);
  ctx.fillStyle = '#8a6f52';
  ctx.fillRect(0, 0, 512, 256);
  const ph = 42;
  for (let y = 0; y < 256; y += ph) {
    const base = 105 + Math.random() * 35;
    ctx.fillStyle = `rgb(${base | 0},${base * 0.72 | 0},${base * 0.5 | 0})`;
    ctx.fillRect(0, y + 1, 512, ph - 2);
    ctx.strokeStyle = 'rgba(60,40,25,0.6)';
    ctx.beginPath();
    for (let x = 0; x <= 512; x += 8) {
      const yy = y + 2 + Math.sin(x * 0.05 + y) * 3 + Math.random() * 3;
      x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(40,25,15,0.8)';
    ctx.fillRect(0, y, 512, 2);
    ctx.fillRect(100 + Math.random() * 300, y, 2, ph);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function stoneTexture() {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#8f8b83';
  ctx.fillRect(0, 0, 256, 256);
  const s = 62;
  let row = 0;
  for (let y = 0; y < 256; y += s, row++) {
    const offset = row % 2 ? s / 2 : 0;
    for (let x = -offset; x < 256; x += s) {
      const v = 135 + Math.random() * 40;
      ctx.fillStyle = `rgb(${v | 0},${v - 4 | 0},${v - 10 | 0})`;
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, s - 6, s - 6, 10);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(160, 160),
  new THREE.MeshStandardMaterial({ map: grassTexture(), roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const W = 11;
const D = 7;
const H = 3.2;
const SKIRT = 0.35;

const brick = brickTexture();
const wallMat = new THREE.MeshStandardMaterial({ map: brick, roughness: 0.92 });
const skirtMat = new THREE.MeshStandardMaterial({ color: 0x6f6a63, roughness: 0.95 });

const skirt = new THREE.Mesh(new THREE.BoxGeometry(W + 0.2, SKIRT, D + 0.2), skirtMat);
skirt.position.y = SKIRT / 2;
skirt.receiveShadow = true;
scene.add(skirt);

const house = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wallMat);
house.position.y = SKIRT + H / 2;
house.castShadow = true;
house.receiveShadow = true;
scene.add(house);

const roofH = 2.6;
const ov = 0.7;
const eave = D / 2 + ov;
const slopeLen = Math.hypot(roofH, eave);
const slopeAngle = Math.atan2(roofH, eave);
const roofTex = roofTexture();
roofTex.repeat.set(6, 2);
const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.8 });

for (const side of [1, -1]) {
  const slab = new THREE.Mesh(new THREE.BoxGeometry(W + ov * 2, 0.16, slopeLen), roofMat);
  slab.position.set(0, SKIRT + H + roofH / 2, (side * eave) / 2);
  slab.rotation.x = side * slopeAngle;
  slab.castShadow = true;
  slab.receiveShadow = true;
  scene.add(slab);
}

const ridge = new THREE.Mesh(
  new THREE.CylinderGeometry(0.14, 0.14, W + ov * 2 + 0.1, 12),
  new THREE.MeshStandardMaterial({ color: 0x26292e, roughness: 0.7 })
);
ridge.rotation.z = Math.PI / 2;
ridge.position.set(0, SKIRT + H + roofH + 0.05, 0);
ridge.castShadow = true;
scene.add(ridge);

const chimney = new THREE.Mesh(
  new THREE.BoxGeometry(0.7, 1.6, 0.7),
  new THREE.MeshStandardMaterial({ map: brickTexture(), roughness: 0.9 })
);
chimney.position.set(-W / 2 + 1.6, SKIRT + H + roofH - 0.1, 0);
chimney.castShadow = true;
scene.add(chimney);
const chimneyCap = new THREE.Mesh(
  new THREE.BoxGeometry(0.95, 0.12, 0.95),
  new THREE.MeshStandardMaterial({ color: 0x55524d, roughness: 0.9 })
);
chimneyCap.position.set(-W / 2 + 1.6, SKIRT + H + roofH + 0.74, 0);
chimneyCap.castShadow = true;
scene.add(chimneyCap);

const skylight = new THREE.Group();
const skFrame = new THREE.Mesh(
  new THREE.BoxGeometry(1.15, 0.1, 1.5),
  new THREE.MeshStandardMaterial({ color: 0x2b2f34, roughness: 0.4, metalness: 0.5 })
);
const skGlass = new THREE.Mesh(
  new THREE.PlaneGeometry(0.95, 1.3),
  new THREE.MeshPhysicalMaterial({
    color: 0x16222e,
    roughness: 0.08,
    metalness: 0.2,
    envMapIntensity: 1.6
  })
);
skGlass.position.y = 0.06;
skylight.add(skFrame, skGlass);
const skZ = 1.4;
skylight.position.set(
  0.6,
  SKIRT + H + roofH * (1 - skZ / eave) + 0.02,
  skZ
);
skylight.rotation.x = slopeAngle;
skylight.castShadow = true;
scene.add(skylight);

const frameMat = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.45 });
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xa8c8de,
  roughness: 0.05,
  metalness: 0.1,
  envMapIntensity: 1.4,
  transparent: true,
  opacity: 0.92
});

function addWindow(w, h, x, y) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, h + 0.18, 0.14), frameMat);
  frame.castShadow = true;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMat);
  glass.position.z = 0.075;
  const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.08, 0.22), frameMat);
  sill.position.set(0, -h / 2 - 0.08, 0.05);
  const barV = new THREE.Mesh(new THREE.BoxGeometry(0.07, h, 0.04), frameMat);
  const barH = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, 0.04), frameMat);
  barV.position.z = 0.08;
  barH.position.z = 0.08;
  g.add(frame, glass, sill, barV, barH);
  g.position.set(x, y, D / 2 + 0.03);
  scene.add(g);
}

const winY = SKIRT + H * 0.62;
addWindow(1.5, 1.5, -3.6, winY);
addWindow(2.4, 1.8, 1.4, winY);
addWindow(2.4, 1.8, 4.1, winY);
addWindow(1.6, 1.2, -3.4, SKIRT + H * 0.28);

const terrW = 7.2;
const terrD = 2.6;
const terrH = 1.05;
const terrX = 1.2;
const terrZ = D / 2 + terrD / 2 - 0.15;

const terrace = new THREE.Mesh(
  new THREE.BoxGeometry(terrW, terrH, terrD),
  new THREE.MeshStandardMaterial({ map: plankTexture(), roughness: 0.75 })
);
terrace.position.set(terrX, terrH / 2, terrZ);
terrace.castShadow = true;
terrace.receiveShadow = true;
scene.add(terrace);

const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.16, 2.24, 0.08), frameMat);
doorFrame.position.set(0.4, terrH + 1.05, D / 2 + 0.015);
scene.add(doorFrame);
const door = new THREE.Mesh(
  new THREE.BoxGeometry(1.0, 2.1, 0.1),
  new THREE.MeshStandardMaterial({ color: 0x3d2b1c, roughness: 0.6 })
);
door.position.set(0.4, terrH + 1.05, D / 2 + 0.03);
door.castShadow = true;
scene.add(door);

const glassRailMat = new THREE.MeshPhysicalMaterial({
  color: 0xd6ecff,
  transparent: true,
  opacity: 0.28,
  roughness: 0.03,
  metalness: 0.1,
  envMapIntensity: 1.8,
  side: THREE.DoubleSide
});
const postMat = new THREE.MeshStandardMaterial({
  color: 0x8b9096,
  roughness: 0.35,
  metalness: 0.85
});

function addRail(x, z, len, alongX) {
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(alongX ? len : 0.05, 1.05, alongX ? 0.05 : len),
    glassRailMat
  );
  panel.position.set(x, terrH + 0.525, z);
  scene.add(panel);
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(alongX ? len : 0.09, 0.06, alongX ? 0.09 : len),
    postMat
  );
  top.position.set(x, terrH + 1.08, z);
  top.castShadow = true;
  scene.add(top);
  const n = Math.max(2, Math.round(len / 1.6));
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.08, 0.06), postMat);
    post.position.set(
      alongX ? x - len / 2 + t * len : x,
      terrH + 0.54,
      alongX ? z : z - len / 2 + t * len
    );
    post.castShadow = true;
    scene.add(post);
  }
}

const tL = terrX - terrW / 2;
const tR = terrX + terrW / 2;
const tB = terrZ - terrD / 2;
const tF = terrZ + terrD / 2;
addRail(tL, terrZ, terrD, false);
addRail(tR, terrZ, terrD, false);
addRail(terrX, tB, terrW, true);
addRail(tL + 1.1, tF, 2.0, true);
addRail(tR - 1.1, tF, 2.0, true);

const stepMat = new THREE.MeshStandardMaterial({ map: stoneTexture(), roughness: 0.95 });
const steps = 7;
const stepH = terrH / steps;
const stepD = 0.34;
const stairX = tR + 0.7;
for (let i = 0; i < steps; i++) {
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.7, stepH, stepD), stepMat);
  step.position.set(stairX, stepH / 2 + i * stepH, tF + stepD / 2 + i * stepD);
  step.castShadow = true;
  step.receiveShadow = true;
  scene.add(step);
}

const pathMat = new THREE.MeshStandardMaterial({ map: stoneTexture(), roughness: 1 });
for (let i = 0; i < 6; i++) {
  const stone = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.8), pathMat);
  stone.position.set(stairX, 0.035, tF + 2.8 + i * 0.95);
  stone.rotation.y = (Math.random() - 0.5) * 0.15;
  stone.receiveShadow = true;
  scene.add(stone);
}

function addTree(x, z, scale = 1) {
  const g = new THREE.Group();
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x5d4128, roughness: 1 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 2.8, 10), barkMat);
  trunk.position.y = 1.4;
  trunk.castShadow = true;
  g.add(trunk);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3c7a2b, roughness: 0.95 });
  const blobs = [
    [0, 3.6, 0, 1.6],
    [1.0, 3.0, 0.4, 1.15],
    [-0.9, 3.1, -0.4, 1.05],
    [0.2, 2.9, -0.9, 0.95],
    [-0.3, 4.2, 0.3, 1.1]
  ];
  for (const [bx, by, bz, r] of blobs) {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), leafMat);
    blob.position.set(bx, by, bz);
    blob.castShadow = true;
    g.add(blob);
  }
  const berryMat = new THREE.MeshStandardMaterial({ color: 0xc81e12, roughness: 0.35 });
  for (let i = 0; i < 40; i++) {
    const berry = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), berryMat);
    const a = Math.random() * Math.PI * 2;
    const e = Math.random() * Math.PI;
    berry.position.set(
      Math.sin(e) * Math.cos(a) * 1.55,
      3.4 + Math.cos(e) * 1.45,
      Math.sin(e) * Math.sin(a) * 1.55
    );
    g.add(berry);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(scale);
  scene.add(g);
}
addTree(-8.2, -0.8, 1.15);
addTree(8.8, -3.4, 0.9);

const bushMat = new THREE.MeshStandardMaterial({ color: 0x41792e, roughness: 1 });
function addBush(x, z, s) {
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 2), bushMat);
  b.position.set(x, s * 0.6, z);
  b.scale.y = 0.72;
  b.castShadow = true;
  scene.add(b);
}
addBush(-4.6, 4.4, 0.75);
addBush(5.6, 4.6, 0.85);
addBush(-6.2, 3.4, 0.6);
addBush(7.2, 2.4, 0.65);
addBush(-2.6, 6.8, 0.55);
addBush(3.2, 7.0, 0.5);
addBush(-0.5, 5.2, 0.45);

const flowerColors = [0xd8354f, 0xffd166, 0xf5f0f6, 0xb565d8];
for (let i = 0; i < 40; i++) {
  const f = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 6, 6),
    new THREE.MeshStandardMaterial({ color: flowerColors[i % 4], roughness: 0.6 })
  );
  const a = Math.random() * Math.PI * 2;
  const r = 5.5 + Math.random() * 14;
  f.position.set(Math.cos(a) * r, 0.06, Math.sin(a) * r);
  scene.add(f);
}

const cloudMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 1,
  emissive: 0xffffff,
  emissiveIntensity: 0.35,
  flatShading: true
});
function addCloud(x, y, z, s) {
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(s * (0.45 + Math.random() * 0.55), 12, 12),
      cloudMat
    );
    puff.position.set(
      (i - 2.5) * s * 0.65 + Math.random() * s * 0.4,
      Math.random() * s * 0.25,
      (Math.random() - 0.5) * s * 0.8
    );
    puff.scale.y = 0.5;
    g.add(puff);
  }
  g.position.set(x, y, z);
  scene.add(g);
}
addCloud(-16, 14, -14, 2.4);
addCloud(11, 16, -18, 2.8);
addCloud(20, 13, -6, 2.0);
addCloud(-5, 17, -24, 2.2);
addCloud(3, 15, -28, 2.6);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.18,
  0.4,
  0.85
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
}
animate();
