// Jamie Padovano
import Transform from "./transform.js";

let gl, shaderProgram;
let tr = new Transform();
tr.frustum(1, 0.75, 5, 15);
tr.translate(0, 0, -10);
tr.rotate(20, "X");
tr.rotate(-30, "Y");

function drawSquare(color) {
  // Push copy of transform.
  tr.push();

  // Send transform matrix data to vertex shader.
  const vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram, "position");
  gl.enableVertexAttribArray(vertexPositionAttribute);

  // Initialize data for 4 points, representing a square.
  // Copy that data to buffer where shaders will have access to
  // it.  gl.vertexAttribPointer indicates how data in the buffer
  // should be interpreted by the shaders:
  //   - 3 values per vertex
  //   - values are floats (32-bit floating-point numbers / 4
  //     bytes each)
  //   - data in range [-1, 1] (not [0, 1])
  //   - distance in bytes from one set of values to the next
  //     is 12.
  //   - distance in bytes from beginning of buffer to first
  //     value is 0.
  let vertexData = [
    -0.5,  0.5, 0,
    -0.5, -0.5, 0,
     0.5, -0.5, 0,
     0.5,  0.5, 0 ];
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData),
    gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPositionAttribute,
    3, gl.FLOAT, false, 12, 0);

  let transformUniform = gl.getUniformLocation(shaderProgram, "transform");
  gl.uniformMatrix4fv(transformUniform, false, new Float32Array(tr.transformationMatrix));
  
  // Send RGB values for black to fragment shader.
  const colorUniform = gl.getUniformLocation(
    shaderProgram, "color");
  
  // Send color (3 float values, representing red, green and blue)
  // to shader instances.
  gl.uniform3f(colorUniform, 0.0, 0.0, 0.0);
  
  // Draw square.
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  
  // Translate forward a little bit, scale a little bit smaller.
  tr.translate(0, 0, 0.01);
  tr.scale(0.95, 0.95, 0.95);
  
  // Send transform matrix data to vertex shader.
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData),
    gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPositionAttribute,
    3, gl.FLOAT, false, 12, 0);

  transformUniform = gl.getUniformLocation(shaderProgram, "transform");
  gl.uniformMatrix4fv(transformUniform, false, new Float32Array(tr.transformationMatrix));
  
  // Send RGB values for color (i.e., color[0], color[1], color[2])
  // to fragment shader.
  
  // Send color (3 float values, representing red, green and blue)
  // to shader instances.
  gl.uniform3f(colorUniform, color[0], color[1], color[2]);
  
  // Draw square again.
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  
  // Restore transform (via pop) to what it was when this function
  // was called.
  tr.pop();
}

  function drawCube(color) {
    tr.push();
    tr.rotate(180, "Y");
    drawSquare(color);
    tr.rotate(-180, "Y");
    tr.rotate(270, "X");
    tr.translate(0, -0.5, 0.5);
    drawSquare(color);
    tr.rotate(-270, "X");
    tr.translate(0, -0.5, 0.5);
    drawSquare(color);
    tr.rotate(-270, "X");
    tr.translate(0, -0.5, 0.5);
    drawSquare(color);
    tr.rotate(90, "Y");
    tr.translate(0.5, 0, 0.5);
    drawSquare(color);
    tr.rotate(180, "Y");
    tr.translate(0, 0, 1.0);
    drawSquare(color);
    tr.pop();
  }

// Everything that needs to happen before we can run main ...
function setup(vertexShaderFileName, fragmentShaderFileName) {
  let vertexShader, fragmentShader;

  // To learn about Promises:
  // https://eloquentjavascript.net/11_async.html#h_sdRy5CTAP
  // To learn about fetch:
  // https://eloquentjavascript.net/18_http.html#h_1Iqv5okrKE

  // When page is loaded, get WebGL context from canvas element
  // and assign it to gl.
  let wp = new Promise(resolve => { window.onload = resolve; });
  wp = wp.then(() => {
    gl = document.querySelector("#canvas").getContext("webgl"); });

  // At this point, wp is Promise representing completion of
  // asynchronous "initialize gl" task.

  let vp = fetch(vertexShaderFileName);
  vp = vp.then(response => response.text());
  vp = Promise.all([vp, wp]);

  // At this point, vp is Promise representing completion of
  // both wp and asynchronous "load vertex shader source code" task.

  let fp = fetch(fragmentShaderFileName);
  fp = fp.then(response => response.text());
  fp = Promise.all([fp, wp]);

  // At this point, fp is Promise representing completion of
  // both wp and asynchronous "load fragment shader source code" task.

  function compileShader(shader, source, fileName) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      let g = gl.getShaderInfoLog(shader);
      console.error(`Unable to compile ${fileName} ...\n${g}`);
    }
  }

  // When vp (gl initialized, vertex shader source loaded) completes,
  // compile vertex shader source code.
  vp = vp.then(
    function([vpResponseText, _]) {
      vertexShader = gl.createShader(gl.VERTEX_SHADER);
      compileShader(vertexShader, vpResponseText,
        vertexShaderFileName);
    }
  );

  // At this point, vp is Promise representing completion of
  // asynchronous "compile vertex shader source code" task.

  // When fp (gl initialized, fragment shader source loaded) completes,
  // compile fragment shader source code.
  fp = fp.then(
    function([fpResponseText, _]) {
      fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      compileShader(fragmentShader, fpResponseText,
        fragmentShaderFileName);
    }
  );

  // At this point, fp is Promise representing completion of
  // asynchronous "compile fragment shader source code" task.

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

  // At this point sp represents completion of full shader setup
  // (load page, initialize gl, load vertex shader source,
  // compile vertex shader source, load fragment shader source,
  // compile fragment shader source, link compiled shader sources,
  // elect to use resulting shader program).

  return sp;
}

// When shader setup is completed (safe to assume gl initialized,
// shader program ready to go), run main.
const sp = setup("square.vert", "square.frag");
sp.then(main);

function main() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  
  function animate() {
    tr.rotate(0.5, "X");
    tr.rotate(-1.5, "Y");
    tr.rotate(1, "Z");
    drawCube([1.0, 0.6, 0.2]);
    
    requestAnimationFrame(animate);
  }
  
  requestAnimationFrame(animate);
}
