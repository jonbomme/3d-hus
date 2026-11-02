import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const app = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ec3ea);
scene.fog = new THREE.Fog(0x8ec3ea, 45, 95);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(13, 7.5, 15);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.6, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 4;
controls.maxDistance = 50;

const hemi = new THREE.HemisphereLight(0xbfd9ff, 0x4a7a3a, 0.9);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff2dd, 2.2);
sun.position.set(12, 18, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -22;
sun.shadow.camera.right = 22;
sun.shadow.camera.top = 22;
sun.shadow.camera.bottom = -22;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 60;
sun.shadow.bias = -0.0005;
scene.add(sun);

function brickTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c9beb4';
  ctx.fillRect(0, 0, 256, 128);
  const bh = 16;
  const bw = 42;
  const gap = 3;
  for (let row = 0; row * (bh + gap) < 128; row++) {
    const y = row * (bh + gap);
    const offset = row % 2 ? (bw + gap) / 2 : 0;
    for (let x = -offset; x < 256; x += bw + gap) {
      const shade = 0.82 + Math.random() * 0.33;
      ctx.fillStyle = `rgb(${Math.round(158 * shade)},${Math.round(58 * shade)},${Math.round(44 * shade)})`;
      ctx.fillRect(x + gap / 2, y + gap / 2, bw - gap, bh - gap);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshStandardMaterial({ color: 0x69a84f, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const W = 10;
const D = 7;
const H = 3.1;

const wallMat = new THREE.MeshStandardMaterial({ map: brickTexture(), roughness: 0.9 });
const house = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wallMat);
house.position.y = H / 2;
house.castShadow = true;
house.receiveShadow = true;
scene.add(house);

const roofH = 2.3;
const ov = 0.6;
const eave = D / 2 + ov;
const slopeLen = Math.hypot(roofH, eave);
const slopeAngle = Math.atan2(roofH, eave);
const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.85 });

for (const side of [1, -1]) {
  const slab = new THREE.Mesh(new THREE.BoxGeometry(W + ov * 2, 0.18, slopeLen), roofMat);
  slab.position.set(0, H + roofH / 2, (side * eave) / 2);
  slab.rotation.x = side * slopeAngle;
  slab.castShadow = true;
  slab.receiveShadow = true;
  scene.add(slab);
}

const ridge = new THREE.Mesh(new THREE.BoxGeometry(W + ov * 2 + 0.06, 0.24, 0.4), roofMat);
ridge.position.set(0, H + roofH + 0.06, 0);
ridge.castShadow = true;
scene.add(ridge);

const skylight = new THREE.Mesh(
  new THREE.BoxGeometry(1.0, 0.08, 1.3),
  new THREE.MeshStandardMaterial({ color: 0x1d2733, roughness: 0.2, metalness: 0.6 })
);
const skylightZ = 1.8;
skylight.position.set(
  1.6,
  H + roofH * (1 - skylightZ / eave) + 0.03,
  skylightZ
);
skylight.rotation.x = slopeAngle;
skylight.castShadow = true;
scene.add(skylight);

const frameMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.5 });
const glassMatWin = new THREE.MeshStandardMaterial({
  color: 0x9fc7e8,
  roughness: 0.15,
  metalness: 0.4
});

function addWindow(w, h, x, y) {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.12), frameMat);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMatWin);
  glass.position.z = 0.065;
  const barV = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.03), frameMat);
  const barH = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.03), frameMat);
  barV.position.z = 0.07;
  barH.position.z = 0.07;
  group.add(frame, glass, barV, barH);
  group.position.set(x, y, D / 2 + 0.02);
  scene.add(group);
}

addWindow(2.6, 1.7, 2.6, 1.65);
addWindow(1.3, 1.3, -3.2, 1.7);

const terrW = 4.2;
const terrD = 3.0;
const terrH = 0.9;
const terrX = -0.5;
const terrZ = D / 2 + terrD / 2 - 0.3;

const terrace = new THREE.Mesh(
  new THREE.BoxGeometry(terrW, terrH, terrD),
  new THREE.MeshStandardMaterial({ color: 0x8a7a68, roughness: 0.9 })
);
terrace.position.set(terrX, terrH / 2, terrZ);
terrace.castShadow = true;
terrace.receiveShadow = true;
scene.add(terrace);

const door = new THREE.Mesh(
  new THREE.BoxGeometry(1.0, 2.0, 0.08),
  new THREE.MeshStandardMaterial({ color: 0x4a3423, roughness: 0.7 })
);
door.position.set(terrX, terrH + 1.0, D / 2 + 0.02);
door.castShadow = true;
scene.add(door);

const stepMat = new THREE.MeshStandardMaterial({ color: 0x9c9c9c, roughness: 0.9 });
const steps = 6;
const stepH = terrH / steps;
const stepD = 0.32;
for (let i = 0; i < steps; i++) {
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, stepH, stepD), stepMat);
  step.position.set(
    terrX,
    stepH / 2 + i * stepH,
    terrZ + terrD / 2 + stepD / 2 + i * stepD
  );
  step.castShadow = true;
  step.receiveShadow = true;
  scene.add(step);
}

const glassRailMat = new THREE.MeshPhysicalMaterial({
  color: 0xcfe8ff,
  transparent: true,
  opacity: 0.35,
  roughness: 0.05,
  metalness: 0.1
});
const postMat = new THREE.MeshStandardMaterial({ color: 0x777d84, roughness: 0.4, metalness: 0.7 });

function addRail(x, z, len, rotY) {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(len, 1.0, 0.05), glassRailMat);
  panel.position.set(x, terrH + 0.5, z);
  panel.rotation.y = rotY;
  scene.add(panel);
  const postCount = Math.max(2, Math.round(len / 1.4));
  for (let i = 0; i < postCount; i++) {
    const t = postCount === 1 ? 0.5 : i / (postCount - 1);
    const px = rotY === 0 ? x - len / 2 + t * len : x;
    const pz = rotY === 0 ? z : z - len / 2 + t * len;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.05, 0.06), postMat);
    post.position.set(px, terrH + 0.525, pz);
    post.castShadow = true;
    scene.add(post);
  }
}

const terrLeft = terrX - terrW / 2;
const terrRight = terrX + terrW / 2;
const terrBack = terrZ - terrD / 2;
const terrFront = terrZ + terrD / 2;
addRail(terrLeft, terrZ, terrD, Math.PI / 2);
addRail(terrRight, terrZ, terrD, Math.PI / 2);
addRail(terrX, terrBack, terrW, 0);
addRail(terrLeft + 0.8, terrFront, 1.5, 0);
addRail(terrRight - 0.8, terrFront, 1.5, 0);

const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb9b3a8, roughness: 1 });
for (let i = 0; i < 5; i++) {
  const stone = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.7), stoneMat);
  stone.position.set(terrX, 0.03, terrFront + 1.1 + i * 0.85);
  stone.receiveShadow = true;
  scene.add(stone);
}

function addTree(x, z) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.3, 2.6, 10),
    new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 1 })
  );
  trunk.position.y = 1.3;
  trunk.castShadow = true;
  g.add(trunk);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f7d2c, roughness: 0.9 });
  const blobs = [
    [0, 3.4, 0, 1.5],
    [0.9, 2.9, 0.4, 1.1],
    [-0.8, 3.0, -0.3, 1.0],
    [0.2, 2.8, -0.8, 0.9]
  ];
  for (const [bx, by, bz, r] of blobs) {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leafMat);
    blob.position.set(bx, by, bz);
    blob.castShadow = true;
    g.add(blob);
  }
  const berryMat = new THREE.MeshStandardMaterial({ color: 0xd42a1e, roughness: 0.4 });
  for (let i = 0; i < 28; i++) {
    const berry = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), berryMat);
    const a = Math.random() * Math.PI * 2;
    const e = Math.random() * Math.PI;
    berry.position.set(
      Math.sin(e) * Math.cos(a) * 1.45,
      3.1 + Math.cos(e) * 1.35,
      Math.sin(e) * Math.sin(a) * 1.45
    );
    g.add(berry);
  }
  g.position.set(x, 0, z);
  scene.add(g);
}
addTree(-7.5, -1.5);

const bushMat = new THREE.MeshStandardMaterial({ color: 0x4c8a35, roughness: 1 });
function addBush(x, z, s) {
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), bushMat);
  b.position.set(x, s * 0.65, z);
  b.scale.y = 0.75;
  b.castShadow = true;
  scene.add(b);
}
addBush(-4.2, 4.6, 0.7);
addBush(4.8, 4.6, 0.8);
addBush(-5.6, 3.6, 0.6);
addBush(5.8, 2.6, 0.65);
addBush(-3.2, 7.0, 0.55);
addBush(3.4, 7.2, 0.5);

const flowerColors = [0xe84a5f, 0xffd166, 0xf8f4f8, 0xc77dff];
for (let i = 0; i < 24; i++) {
  const f = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 6, 6),
    new THREE.MeshStandardMaterial({ color: flowerColors[i % flowerColors.length], roughness: 0.6 })
  );
  const a = Math.random() * Math.PI * 2;
  const r = 6 + Math.random() * 12;
  f.position.set(Math.cos(a) * r, 0.06, Math.sin(a) * r);
  scene.add(f);
}

const cloudMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 1,
  emissive: 0xffffff,
  emissiveIntensity: 0.25
});
function addCloud(x, y, z, s) {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(s * (0.5 + Math.random() * 0.5), 10, 10),
      cloudMat
    );
    puff.position.set(
      (i - 2) * s * 0.7 + Math.random() * s * 0.4,
      Math.random() * s * 0.3,
      (Math.random() - 0.5) * s
    );
    puff.scale.y = 0.55;
    g.add(puff);
  }
  g.position.set(x, y, z);
  scene.add(g);
}
addCloud(-14, 13, -12, 2.2);
addCloud(10, 15, -16, 2.6);
addCloud(18, 12, -4, 1.8);
addCloud(-4, 16, -20, 2.0);
addCloud(2, 14, -24, 2.4);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
