// Jamie Padovano
import * as THREE from 'three';

let camera, scene, renderer;
let geometry, material, mesh;
let uniforms;
let aspect = window.innerWidth / window.innerHeight;
let initPrecision = 2;
let frameCount = 0;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  camera.position.z = 1;
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({antialias: false, precision: 'highp'});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  uniforms = {
    res: {type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    aspect: {type: 'float', value: aspect}
  }

  geometry = new THREE.PlaneGeometry(2, 2);
  material = new THREE.ShaderMaterial({
    fragmentShader: fragmentShader(initPrecision),
    uniforms: uniforms
  })

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

function fragmentShader(precision) {
  return `
    precision highp float;
    uniform vec2 res;
    uniform float aspect;
    
    float mandelbrot(vec2 c) {
      float alpha = 1.0;
      vec2 z = vec2(0.0, 0.0);

      for (int i=0; i < ${precision}; i++) {
        float x_sq = z.x * z.x;
        float y_sq = z.y * z.y;
        vec2 z_sq = vec2(x_sq - y_sq, 2.0 * z.x * z.y);

        z = z_sq + c;

        if (x_sq + y_sq > 4.0) {
          alpha = float(i) / 200.0;
          break;
        }
      }
      return alpha;
    }

    void main() {
      vec2 uv = 4.0 * vec2(aspect, 1.0) * gl_FragCoord.xy / res - 2.0 * vec2(aspect, 1.0);
      float s = 1.0 - mandelbrot(uv);

      vec3 coord = vec3(s, s, s);
      gl_FragColor = vec4(pow(coord, vec3(7.0, 8.0, 5.0)), 1.0);
    }
  `
}

function animate() {
  frameCount++;
  if (frameCount % 8 == 0) initPrecision++;
  if (frameCount < 300) {
    material.fragmentShader = fragmentShader(initPrecision);
    material.needsUpdate = true;
  } else {
    frameCount = 0;
    initPrecision = 2;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}