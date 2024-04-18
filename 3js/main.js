import * as THREE from 'three';
import { SepiaShader } from 'three/examples/jsm/Addons.js';

let points, count = 0;;
let container;
let geometry;
let camera, scene, renderer;
let clock;

const SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50;


init();
animate();

function init() {
  container = document.getElementById('container');

  // set up scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x050505 );

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 1000;
  camera.position.y = 500;
  // camera.position.x = 300;
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  clock = new THREE.Clock();

  container.appendChild(renderer.domElement);

  // set up points
  let numPoints = AMOUNTX * AMOUNTY;
  geometry = new THREE.BufferGeometry();
  let vertices = [];
  const colors = [];
  const color = new THREE.Color();

  const n1 = 1000;
  const n2 = n1 / 2;
  let i = 0, j =0;

  // for (let i=0; i < numPoints; i++) {
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        // const x = Math.random() * n1 - n2;
        // const y = Math.random() * n1 - n2 - 500;
        // const z = Math.random() * n1 - n2;

        const x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
        const y = 0;
        const z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);

        vertices[i] = x;
        vertices[i + 1] = y;
        vertices[i + 2] = z;
    
        // vertices.push(x, y, z);
    
        const vx = ( x / n1 ) + 0.5;
        const vy = ( y / n1 ) + 0.5;
        const vz = ( z / n1 ) + 0.5;
    
        color.setRGB( vx, vy, vz, THREE.SRGBColorSpace );
    
        colors.push( color.r, color.g, color.b );
      }
    }
  // }

  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
  geometry.computeBoundingSphere();

  const material = new THREE.PointsMaterial( { size: 3, vertexColors: true } );
  points = new THREE.Points( geometry, material );
  scene.add( points );
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  const positions = points.geometry.attributes.position.array;

  // run particles through sin wave 
  let i = 0, j = 0;

  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[ i + 1 ] = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) +
              ( Math.sin( ( iy + count ) * 0.5 ) * 50 );

      // scales[ j ] = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 20 +
      //         ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 20;

      i += 3;
      j++;
    }
  }

  geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);

  count += 0.05;
}