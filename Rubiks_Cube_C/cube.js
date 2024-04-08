// Jamie Padovano

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

  static invert(transform) {
    let [ m00, m01, m02, m03,
          m10, m11, m12, m13,
          m20, m21, m22, m23,
          m30, m31, m32, m33 ] = transform.matrix;
    
    let i00 =  m11 * m22 * m33  -  m11 * m23 * m32 -
               m21 * m12 * m33  +  m21 * m13 * m32 +
               m31 * m12 * m23  -  m31 * m13 * m22;
    
    let i10 = -m10 * m22 * m33  +  m10 * m23 * m32 +
               m20 * m12 * m33  -  m20 * m13 * m32 -
               m30 * m12 * m23  +  m30 * m13 * m22;
    
    let i20 =  m10 * m21 * m33  -  m10 * m23 * m31 -
               m20 * m11 * m33  +  m20 * m13 * m31 +
               m30 * m11 * m23  -  m30 * m13 * m21;
    
    let i30 = -m10 * m21 * m32  +  m10 * m22 * m31 +
               m20 * m11 * m32  -  m20 * m12 * m31 -
               m30 * m11 * m22  +  m30 * m12 * m21;
    
    let det = m00 * i00 + m01 * i10 + m02 * i20 + m03 * i30;
    
    // Assume det != 0 (i.e., matrix has an inverse).
      
    i00 = i00 / det;
    i10 = i10 / det;
    i20 = i20 / det;
    i30 = i30 / det;
    
    let i01 = (-m01 * m22 * m33  +  m01 * m23 * m32 +
                m21 * m02 * m33  -  m21 * m03 * m32 -
                m31 * m02 * m23  +  m31 * m03 * m22) / det;
    
    let i11 = ( m00 * m22 * m33  -  m00 * m23 * m32 -
                m20 * m02 * m33  +  m20 * m03 * m32 +
                m30 * m02 * m23  -  m30 * m03 * m22) / det;
    
    let i21 = (-m00 * m21 * m33  +  m00 * m23 * m31 +
                m20 * m01 * m33  -  m20 * m03 * m31 -
                m30 * m01 * m23  +  m30 * m03 * m21) / det;
    
    let i31 = ( m00 * m21 * m32  -  m00 * m22 * m31 -
                m20 * m01 * m32  +  m20 * m02 * m31 +
                m30 * m01 * m22  -  m30 * m02 * m21) / det;
    
    let i02 = ( m01 * m12 * m33  -  m01 * m13 * m32 -
                m11 * m02 * m33  +  m11 * m03 * m32 +
                m31 * m02 * m13  -  m31 * m03 * m12) / det;
    
    let i12 = (-m00 * m12 * m33  +  m00 * m13 * m32 +
                m10 * m02 * m33  -  m10 * m03 * m32 -
                m30 * m02 * m13  +  m30 * m03 * m12) / det;
    
    let i22 = ( m00 * m11 * m33  -  m00 * m13 * m31 -
                m10 * m01 * m33  +  m10 * m03 * m31 +
                m30 * m01 * m13  -  m30 * m03 * m11) / det;
    
    let i32 = (-m00 * m11 * m32  +  m00 * m12 * m31 +
                m10 * m01 * m32  -  m10 * m02 * m31 -
                m30 * m01 * m12  +  m30 * m02 * m11) / det;
    
    let i03 = (-m01 * m12 * m23  +  m01 * m13 * m22 +
                m11 * m02 * m23  -  m11 * m03 * m22 -
                m21 * m02 * m13  +  m21 * m03 * m12) / det;
    
    let i13 = ( m00 * m12 * m23  -  m00 * m13 * m22 -
                m10 * m02 * m23  +  m10 * m03 * m22 +
                m20 * m02 * m13  -  m20 * m03 * m12) / det;
    
    let i23 = (-m00 * m11 * m23  +  m00 * m13 * m21 +
                m10 * m01 * m23  -  m10 * m03 * m21 -
                m20 * m01 * m13  +  m20 * m03 * m11) / det;
    
    let i33 = ( m00 * m11 * m22  -  m00 * m12 * m21 -
                m10 * m01 * m22  +  m10 * m02 * m21 +
                m20 * m01 * m12  -  m20 * m02 * m11) / det;
    
    return new Transform([ i00, i01, i02, i03,
                           i10, i11, i12, i13,
                           i20, i21, i22, i23,
                           i30, i31, i32, i33 ]);
  }

  static transform3DVertex(vertex, transformation) {
    const [v0, v1, v2, v3] = [...Object.values(vertex), 1];
    const [ t0, t1, t2, t3,
            t4, t5, t6, t7,
            t8, t9, t10, t11,
            t12, t13, t14, t15 ] = transformation.matrix;

    const [a, b, c, d] = [ t0 * v0 + t1 * v1 + t2 * v2 + t3 * v3,
                         t4 * v0 + t5 * v1 + t6 * v2 + t7 * v3,
                         t8 * v0 + t9 * v1 + t10 * v2 + t11 * v3,
                         t12 * v0 + t13 * v1 + t14 * v2 + t15 * v3 ];

    return { x: a / d, y: b / d, z: c / d };
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

let downX;
let downY;
let mouseDownCVV;

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

      
  window.addEventListener("mousedown", mousedownHandler);
  window.addEventListener("mouseup", mouseupHandler);

  function animate(frameCount, frameFunction, endFunction) {
    window.removeEventListener("mousedown", mousedownHandler);
    window.removeEventListener("mouseup", mouseupHandler);
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

  async function randomGroupRotate({ group, axis, ccw }) {

    // rotate group
    await animate(90,
      (subCube) => {
        if (subCube[axis?.toLowerCase()] === group)
          subCube.rot.preRotate(ccw ? 1 : -1, axis);
        subCube.draw();
      },
      (subCube) => {
        if (subCube[axis?.toLowerCase()] === group)
          subCube.rotateXYZ(ccw, axis);
      }
    );

    window.addEventListener("mousedown", mousedownHandler);
    window.addEventListener("mouseup", mouseupHandler);
  }

  // this seems to trick the cube into getting initially drawn without having to randomly rotate a group
  randomGroupRotate({group: 2, axis: "F", ccw: false});

  function mousedownHandler(event) {
    let cv = document.querySelector("#canvas");
    const xPos = event.pageX - cv.offsetLeft;
    const yPos = event.pageY - cv.offsetTop;
    mouseDownCVV = coordsToCVV(xPos, yPos);
    downX = mouseDownCVV.front.x;
    downY = mouseDownCVV.front.y;
    console.log(`Mouse Down: ${downX}, ${downY}`);
  }
  
  function mouseupHandler(event) {
    let cv = document.querySelector("#canvas");
    const xPos = event.pageX - cv.offsetLeft;
    const yPos = event.pageY - cv.offsetTop;
    const newCoords = coordsToCVV(xPos, yPos);
    const xChange = newCoords.front.x - downX;
    const yChange = newCoords.front.y - downY;
    console.log(`Mouse Up: ${xChange}, ${yChange}`);

    const frustumPointsDown = calcFrustumPoints(mouseDownCVV);
    const planeIntersection = calcPlaneIntersection(frustumPointsDown);
    
    const frustumPointsUp = calcFrustumPoints(newCoords)
    const mouseUpPoint = mouseReleasePoint(planeIntersection.plane, frustumPointsUp);
    let direction = dragDirection(planeIntersection, mouseUpPoint);
    const groupSelection = subgroupSelection(planeIntersection, mouseUpPoint, direction);
  
    // trigger rotation
    if (planeIntersection.x >= -1.5 && planeIntersection.x <= 1.5 
        && planeIntersection.y >= -1.5 && planeIntersection.y <= 1.5 
        && planeIntersection.z >= -1.5 && planeIntersection.z <= 1.5) randomGroupRotate(groupSelection);
  }

  function coordsToCVV(canvasX, canvasY) {
    let cv = document.querySelector("#canvas");
    const x = (canvasX / cv.clientWidth) * 2 - 1;
    const y = -((canvasY / cv.clientHeight) * 2 - 1);

    const viewportX = x;
    const viewportY = y;

    return { front: { x: viewportX, y: viewportY, z: -1 }, back: {x: viewportX, y: viewportY, z: 1} };
  }
  
  function calcFrustumPoints(points) {
    const invertedSceneTransform = Transform.invert(transform);
    const front = Transform.transform3DVertex(points.front, invertedSceneTransform);
    const back = Transform.transform3DVertex(points.back, invertedSceneTransform);
    return { front: front, back: back };
  }

  function calcPlaneIntersection(points) {
    const deltaX = points.back.x - points.front.x;
    const deltaY = points.back.y - points.front.y;
    const deltaZ = points.back.z - points.front.z;

    // x plane intersection
    const xPlanePoint = {};
    const tX = (1.5 - points.front.x) / deltaX;
    xPlanePoint.x = 1.5;
    xPlanePoint.y = points.front.y + deltaY * tX;
    xPlanePoint.z = points.front.z + deltaZ * tX;

    // y plane intersection
    const yPlanePoint = {};
    const tY = (1.5 - points.front.y) / deltaY;
    yPlanePoint.y = 1.5;
    yPlanePoint.x = points.front.x + deltaX * tY;
    yPlanePoint.z = points.front.z + deltaZ * tY;
    
    // z plane intersection
    const zPlanePoint = {};
    const tZ = (1.5 - points.front.z) / deltaZ;
    zPlanePoint.z = 1.5;
    zPlanePoint.x = points.front.x + deltaX * tZ;
    zPlanePoint.y = points.front.y + deltaY * tZ;

    // determine correct face
    let plane = "";
    let intersection = {};
    if (!Object.values(xPlanePoint).some(val => val < -1.5 || val > 1.5)) {
      plane = "X";
      intersection = xPlanePoint;
    }
    else if (!Object.values(yPlanePoint).some(val => val < -1.5 || val > 1.5)) {
      plane = "Y";
      intersection = yPlanePoint;
    }
    else if (!Object.values(zPlanePoint).some(val => val < -1.5 || val > 1.5)) {
      plane = "Z";
      intersection = zPlanePoint;
    }

    return { plane: plane,  ...intersection };
  }

  function mouseReleasePoint(plane, points) {
    const deltaX = points.back.x - points.front.x;
    const deltaY = points.back.y - points.front.y;
    const deltaZ = points.back.z - points.front.z;
    let planePoint = {};

    if (plane == "X") {
      const tX = (1.5 - points.front.x) / deltaX;
      planePoint.x = 1.5;
      planePoint.y = points.front.y + deltaY * tX;
      planePoint.z = points.front.z + deltaZ * tX;
    } else if (plane == "Y") {
      const tY = (1.5 - points.front.y) / deltaY;
      planePoint.y = 1.5;
      planePoint.x = points.front.x + deltaX * tY;
      planePoint.z = points.front.z + deltaZ * tY;
    } else if (plane == "Z") {
      const tZ = (1.5 - points.front.z) / deltaZ;
      planePoint.z = 1.5;
      planePoint.x = points.front.x + deltaX * tZ;
      planePoint.y = points.front.y + deltaY * tZ;
    }

    return planePoint;
  }

  function dragDirection(planeIntersection, upPoint) {
    const deltaX = Math.abs(upPoint.x - planeIntersection.x);
    const deltaY = Math.abs(upPoint.y - planeIntersection.y);
    const deltaZ = Math.abs(upPoint.z - planeIntersection.z);
    let dragDirection = "";

    if (planeIntersection.plane == "X") {
      dragDirection = deltaY > deltaZ ? "Y" : "Z";
    } else if (planeIntersection.plane == "Y") {
      dragDirection = deltaX > deltaZ ? "X" : "Z";
    } else if (planeIntersection.plane == "Z") {
      dragDirection = deltaX > deltaY ? "X" : "Y";
    }

    return dragDirection;
  }

  function subgroupSelection(mouseDown, mouseUp, dragDirection) {
    // return -1, 0, 1 for subgroup selection
    let subcubeGroup;
    let axis;
    let ccw;
    if (mouseDown.plane == "X") {
      if (dragDirection == "Y") {
        axis = "Z";
        ccw = mouseDown.y < mouseUp.y;
        if (mouseDown.z < -0.5) {
          subcubeGroup = -1;
        } else if (mouseDown.z < 0.5) {
          subcubeGroup = 0;
        } else {
          subcubeGroup = 1;
        }
      } else if (dragDirection == "Z") {
        axis = "Y";
        ccw = mouseDown.z > mouseUp.z;
        if (mouseDown.y < -0.5) {
          subcubeGroup = -1;
        } else if (mouseDown.y < 0.5) {
          subcubeGroup = 0;
        } else {
          subcubeGroup = 1;
        }
      }
    } else if (mouseDown.plane == "Y") {
      if (dragDirection == "X") {
        axis = "Z";
        ccw = mouseDown.x > mouseUp.x;
        if (mouseDown.z < -0.5) {
          subcubeGroup = -1;
        } else if (mouseDown.z < 0.5) {
          subcubeGroup = 0;
        } else {
          subcubeGroup = 1;
        }
      } else if (dragDirection == "Z") {
        axis = "X";
        ccw = mouseDown.z < mouseUp.z;
        if (mouseDown.x < -0.5) {
          subcubeGroup = -1;
        } else if (mouseDown.x < 0.5) {
          subcubeGroup = 0;
        } else {
          subcubeGroup = 1;
        }
      }
    } else if (mouseDown.plane == "Z") {
      if (dragDirection == "X") {
        axis = "Y";
        ccw = mouseDown.x < mouseUp.x;
        if (mouseDown.y < -0.5) {
          subcubeGroup = -1;
        } else if (mouseDown.y < 0.5) {
          subcubeGroup = 0;
        } else {
          subcubeGroup = 1;
        }
      } else if (dragDirection == "Y") {
        axis = "X";
        ccw = mouseDown.y > mouseUp.y;
        if (mouseDown.x < -0.5) {
          subcubeGroup = -1;
        } else if (mouseDown.x < 0.5) {
          subcubeGroup = 0;
        } else {
          subcubeGroup = 1;
        }
      }
    }

    return { group: subcubeGroup, axis: axis, ccw: ccw };
  }
}