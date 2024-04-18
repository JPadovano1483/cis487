// Jamie Padovano

import * as THREE from 'three';

const SEPARATION = 2, AMOUNTX = 500, AMOUNTY = 500;

let container;
let camera, scene, renderer;

let particles, count = 0;

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 1000;

  scene = new THREE.Scene();

  const numParticles = AMOUNTX * AMOUNTY;

  const positions = [];
  const scales = new Float32Array(numParticles);
  const color = new THREE.Color();
  const colors = [];

  let i = 0, j = 0;

  const n = 1000;

  for (let ix = 0; ix < AMOUNTX; ix ++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      const x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
      const y = 0; // y
      const z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z

      positions.push(x, y, z);

      scales[j] = 1;

      const r = (x / n) + 0.5;
      const g = (y / n) + 0.5;
      const b = (z / n) + 0.5;

      color.setRGB(r, g, b, THREE.SRGBColorSpace);

      colors.push(color.r, color.g, color.b);

      i += 3;
      j++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({ size: 1.5, vertexColors: true })

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  container.style.touchAction = 'none';
  container.addEventListener('pointermove', onPointerMove);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
  if (event.isPrimary === false) return;

  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  camera.position.x += (mouseX - camera.position.x) * .05;
  camera.position.y += (-mouseY - camera.position.y) * .05;
  camera.lookAt(scene.position);

  const positions = particles.geometry.attributes.position.array;
  const scales = particles.geometry.attributes.scale.array;

  let i = 0, j = 0;

  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
              (Math.sin((iy + count) * 0.5) * 50);

      scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 20 +
              (Math.sin((iy + count) * 0.5) + 1) * 20;

      i += 3;
      j++;
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.scale.needsUpdate = true;

  renderer.render(scene, camera);

  count += 0.05;
}