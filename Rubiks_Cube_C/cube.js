"use strict";

let gl, shaderProgram, transform, transformUniform, colorUniform;

class Transform {

  constructor(matrix) {

    if (matrix === undefined) {
      this.matrix = [ 1, 0, 0, 0,
                      0, 1, 0, 0,
                      0, 0, 1, 0,
                      0, 0, 0, 1 ];
    } else {
      this.matrix = matrix;
    }
    
    this.stack = [];
  }
  
  push() {
    this.stack.push(this.matrix);
  }

  pop() {
    if (this.stack.length > 0)
      this.matrix = this.stack.pop();
  }
  
  static multiply(a, b) {
    const [ a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            a30, a31, a32, a33 ] = a;
    const [ b00, b01, b02, b03,
            b10, b11, b12, b13,
            b20, b21, b22, b23,
            b30, b31, b32, b33 ] = b;
    
    return [ a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
             a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
             a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
             a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
             
             a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
             a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
             a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
             a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,

             a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
             a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
             a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
             a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,

             a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
             a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
             a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
             a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33 ];
  }

  multiplyBy(that) {
    this.matrix = Transform.multiply(this.matrix, that.matrix);
    return this;
  }

  translate(tx, ty, tz) {
    const m = [ 1, 0, 0, tx,
                0, 1, 0, ty,
                0, 0, 1, tz,
                0, 0, 0,  1 ];
    this.matrix = Transform.multiply(this.matrix, m);
    return this;
  }
  
  scale(sx, sy, sz) {
    const m = [ sx, 0, 0, 0,
                0, sy, 0, 0,
                0,  0, sz, 0,
                0,  0,  0,  1 ];
    this.matrix = Transform.multiply(this.matrix, m);
    return this;
  }
  
  rotate(angle, axis, pre=false) {
    const a = Math.PI * angle / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    let m;

    if (axis === "X") {
      m = [ 1, 0,  0, 0,
            0, c, -s, 0,
            0, s,  c, 0,
            0, 0,  0, 1 ];

    } else if (axis === "Y") {
      m = [  c, 0, s, 0,
             0, 1, 0, 0,
            -s, 0, c, 0,
             0, 0, 0, 1 ];

    } else if (axis === "Z") {
      m = [ c, -s, 0, 0,
            s,  c, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1 ];
    }

    this.matrix = pre ?
      Transform.multiply(m, this.matrix) :
      Transform.multiply(this.matrix, m);

    return this;
  }

  preRotate(angle, axis) {
    return this.rotate(angle, axis, true);
  }
  
  frustum(right, top, near, far) {
    const a = (near + far) / (near - far);
    const b = 2 * near * far / (near - far);
    const m = [ near / right,          0,  0, 0,
                           0, near / top,  0, 0,
                           0,          0,  a, b,
                           0,          0, -1, 0 ];

    this.matrix = Transform.multiply(this.matrix, m);
    return this;
  }
}

class SubCube {

  constructor(x, y, z) {
    this.x = this.x0 = x;
    this.y = this.y0 = y;
    this.z = this.z0 = z;
    this.rot = new Transform();
  }

  drawSquare(color, outside=true) {
    transform.push();
    transform.translate(0, 0, 0.5);
    gl.uniformMatrix4fv(transformUniform, false, transform.matrix);
    gl.uniform3f(colorUniform, 0, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    if (outside) {
      transform.scale(0.9, 0.9, 1);
      transform.translate(0, 0, 0.001);
      gl.uniformMatrix4fv(transformUniform, false, transform.matrix);
      gl.uniform3f(colorUniform, ...color);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    transform.pop();
  }

  draw() {
    transform.push();
    transform.multiplyBy(this.rot);
    transform.translate(this.x0, this.y0, this.z0);
    
    this.drawSquare([0, 0.6, 0.3], this.z0 === 1); // +Z
    transform.rotate(90, "Y");
    this.drawSquare([0.8, 0, 0], this.x0 === 1); // +X
    transform.rotate(90, "Y");
    this.drawSquare([0.1, 0.4, 0.8], this.z0 === -1); // -Z
    transform.rotate(90, "Y");
    this.drawSquare([0.9, 0.5, 0], this.x0 === -1); // -X
    transform.rotate(90, "X");
    this.drawSquare([0.9, 0.9, 0.9], this.y0 === -1); // -Y
    transform.rotate(180, "X");
    this.drawSquare([1, 0.8, 0], this.y0 === 1); // +Y
    
    transform.pop();
  }

  rotateXYZ(ccw, axis) {

    if (axis === "X") {
      let y = ccw ? -this.z : this.z;
      this.z = ccw ? this.y : -this.y;
      this.y = y;
    
    } else if (axis === "Y") {
      let x = ccw ? this.z : -this.z;
      this.z = ccw ? -this.x : this.x;
      this.x = x;
    
    } else if (axis === "Z") {
      let x = ccw ? -this.y : this.y;
      this.y = ccw ? this.x : -this.x;
      this.x = x;
    }
  }
}

function setup(vertexShaderFileName, fragmentShaderFileName) {
  let vertexShader, fragmentShader;

  let wp = new Promise(resolve => { window.onload = resolve; });
  wp = wp.then(() => {
    gl = document.querySelector("#canvas").getContext("webgl"); });
  let vp = fetch(vertexShaderFileName);
  vp = vp.then(response => response.text());
  vp = Promise.all([vp, wp]);
  let fp = fetch(fragmentShaderFileName);
  fp = fp.then(response => response.text());
  fp = Promise.all([fp, wp]);

  function compileShader(shader, source, fileName) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      let g = gl.getShaderInfoLog(shader);
      console.error(`Unable to compile ${fileName} ...\n${g}`);
    }
  }

  vp = vp.then(
    function([vpResponseText, _]) {
      vertexShader = gl.createShader(gl.VERTEX_SHADER);
      compileShader(vertexShader, vpResponseText,
        vertexShaderFileName);
    }
  );

  fp = fp.then(
    function([fpResponseText, _]) {
      fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      compileShader(fragmentShader, fpResponseText,
        fragmentShaderFileName);
    }
  );

  let sp = Promise.all([vp, fp]);
  sp = sp.then(
    function() {
      shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);
      gl.useProgram(shaderProgram);
    }
  );

  return sp;
}

const sp = setup("cube.vert", "cube.frag");
sp.then(main);

function main() {
  gl.clearColor(1, 1, 1, 1);
  gl.enable(gl.DEPTH_TEST);

  const vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram, "position");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  const vertexData = [
    -0.5,  0.5, 0,
    -0.5, -0.5, 0,
     0.5, -0.5, 0,
     0.5,  0.5, 0 ];
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData),
    gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPositionAttribute,
    3, gl.FLOAT, false, 12, 0);

  transformUniform = gl.getUniformLocation(shaderProgram, "transform");
  colorUniform = gl.getUniformLocation(shaderProgram, "color");

  transform = new Transform();
  transform.frustum(1, 0.75, 5, 35);
  transform.translate(0, 0, -20).rotate(20, "X").rotate(-30, "Y");

  let subCubes = [];

  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++)
        subCubes.push(new SubCube(x, y, z));

  function animate(frameCount, frameFunction, endFunction) {
    return new Promise((resolve) => {
      (function nextFrame() {
        subCubes.forEach(frameFunction);

        if (--frameCount === 0) {
          subCubes.forEach(endFunction);
          resolve();
        } else {
          requestAnimationFrame(nextFrame);
        }
      })();
    });
  }

  (async function randomGroupRotate() {

    // pause
    await animate(45, ()=>{}, ()=>{});
    
    // pick random group and rotation direction
    const axis = (["X", "Y", "Z"])[Math.floor(Math.random() * 3)];
    const group = Math.floor(Math.random() * 3) - 1;
    const ccw = Math.random() < 0.5;

    // rotate group
    await animate(90,
      (subCube) => {
        if (subCube[axis.toLowerCase()] === group)
          subCube.rot.preRotate(ccw ? 1 : -1, axis);
        subCube.draw();
      },
      (subCube) => {
        if (subCube[axis.toLowerCase()] === group)
          subCube.rotateXYZ(ccw, axis);
      }
    );

    randomGroupRotate();
  })();
}