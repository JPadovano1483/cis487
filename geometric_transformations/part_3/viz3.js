// Jamie Padovano

"use strict";

// Format numbers to be (at least) <spaces> characters wide,
// with <places> digits after the decimal point.
function formatNum(num, spaces, places) {
  let s = num.toFixed(places);
  while (s.length < spaces) s = " " + s;

  return s;
}

// Create HTML string to display JavaScript array as a matrix.
function matrixHTML(a) {

  // Unicode symbols needed to make big square brackets.
  let vt = "&#9474";
  let nw = "&#9484";
  let ne = "&#9488";
  let sw = "&#9492";
  let se = "&#9496";

  // Format numbers to be (at least) 6 characters wide, with 2
  // digits after the decimal point.
  let f = n => formatNum(n, 6, 2);

  // For 6-value array, representing 2D transformation matrix.
  // (Full matrix would have 9 values, but only the 6 values
  // needed for scale, rotation and translation are used.)
  if (a.length == 2) {
    return "<pre>\n" +
      nw + "                " + ne + "\n" +
      vt + ` ${f(a[0])}  ${f(a[1])} ` + vt + "\n" +
      sw + "                " + se + "\n" +
      "</pre>";
  } else if (a.length == 3) {
    return "<pre>\n" +
      nw + "                        " + ne + "\n" +
      vt + ` ${f(a[0])}  ${f(a[1])}  ${f(a[2])} ` + vt + "\n" +
      sw + "                        " + se + "\n" +
      "</pre>";
  } else if (a.length == 4) {
    return "<pre>\n" +
      nw + "                                " + ne + "\n" +
      vt + ` ${f(a[ 0])}  ${f(a[ 1])}  ${f(a[ 2])}  ${f(a[ 3])} ` + vt + "\n" +
      sw + "                                " + se + "\n" +
      "</pre>";
  } else if (a.length == 6) {
    return "<pre>\n" +
      nw + "                " + ne + "\n" +
      vt + ` ${f(a[0])}  ${f(a[1])} ` + vt + "\n" +
      vt + ` ${f(a[2])}  ${f(a[3])} ` + vt + "\n" +
      vt + ` ${f(a[4])}  ${f(a[5])} ` + vt + "\n" +
      sw + "                " + se + "\n" +
      "</pre>";
      
  // For 16-value array, representing 3D transformation matrix.
  } else {
    return "<pre>\n" +
      nw + "                                " + ne + "\n" +
      vt + ` ${f(a[ 0])}  ${f(a[ 1])}  ${f(a[ 2])}  ${f(a[ 3])} ` + vt + "\n" +
      vt + ` ${f(a[ 4])}  ${f(a[ 5])}  ${f(a[ 6])}  ${f(a[ 7])} ` + vt + "\n" +
      vt + ` ${f(a[ 8])}  ${f(a[ 9])}  ${f(a[10])}  ${f(a[11])} ` + vt + "\n" +
      vt + ` ${f(a[12])}  ${f(a[13])}  ${f(a[14])}  ${f(a[15])} ` + vt + "\n" +
      sw + "                                " + se + "\n" +
      "</pre>";
  }
}

function pTimesM(p, m) {

  // 2D
  if (p.length == 3) {
    const [ p0, p1, p2 ] = p;
    const [ m00, m01,
            m10, m11,
            m20, m21 ] = m;

    return [ p0 * m00 + p1 * m10 + p2 * m20,
             p0 * m01 + p1 * m11 + p2 * m21 ];
  // 3D
  } else {
    const [ p0, p1, p2, p3 ] = p;
    const [ m0, m1, m2, m3,
            m4, m5, m6, m7,
            m8, m9, m10, m11,
            m12, m13, m14, m15 ] = m;

    return [ p0 * m0 + p1 * m4 + p2 * m8 + p3 * m12,
             p0 * m1 + p1 * m5 + p2 * m9 + p3 * m13,
             p0 * m2 + p1 * m6 + p2 * m10 + p3 * m14,
             p0 * m3 + p1 * m7 + p2 * m11 + p3 * m15];
  }
}

function mTimesT(m, t) {
  // multiply m * t, return composite transformation matrix
  // 2D
  if (m.length == 6) {
    const [ m00, m01,
            m10, m11,
            m20, m21 ] = m;
    const [ t00, t01,
            t10, t11,
            t20, t21 ] = t;
    return  [ m00 * t00 + m01 * t10,
              m00 * t01 + m01 * t11,

              m10 * t00 + m11 * t10,
              m10 * t01 + m11 * t11,

              m20 * t00 + m21 * t10 + t20,
              m20 * t01 + m21 * t11 + t21];
  // 3D
  } else {
    const [ m0, m1, m2, m3,
      m4, m5, m6, m7,
      m8, m9, m10, m11,
      m12, m13, m14, m15 ] = m;
    const [ t0, t1, t2, t3,
            t4, t5, t6, t7,
            t8, t9, t10, t11,
            t12, t13, t14, t15 ] = t;
    return [ m0 * t0 + m1 * t4 + m2 * t8 + m3 * t12,
             m0 * t1 + m1 * t5 + m2 * t9 + m3 * t13,
             m0 * t2 + m1 * t6 + m2 * t10 + m3 * t14,
             m0 * t3  + m1 * t7 + m2 * t11 + m3 * t15,
            
             m4 * t0 + m5 * t4 + m6 * t8 + m7 * t12,
             m4 * t1 + m5 * t5 + m6 * t9 + m7 * t13,
             m4 * t2 + m5 * t6 + m6 * t10 + m7 * t14,
             m4 * t3  + m5 * t7 + m6 * t11 + m7 * t15,
            
             m8 * t0 + m9 * t4 + m10 * t8 + m11 * t12,
             m8 * t1 + m9 * t5 + m10 * t9 + m11 * t13,
             m8 * t2 + m9 * t6 + m10 * t10 + m11 * t14,
             m8 * t3  + m9 * t7 + m10 * t11 + m11 * t15,
            
             m12 * t0 + m13 * t4 + m14 * t8 + m15 * t12,
             m12 * t1 + m13 * t5 + m14 * t9 + m15 * t13,
             m12 * t2 + m13 * t6 + m14 * t10 + m15 * t14,
             m12 * t3  + m13 * t7 + m14 * t11 + m15 * t15];
  }
  
}

function rotateZ(m, a) {
  const s = Math.sin(a);
  const c = Math.cos(a);
  const rotationMatrix = [c, s,
                          -s, c,
                          0, 0];
  return mTimesT(m, rotationMatrix);
}

function rotateY3d(m, a) {
  const s = Math.sin(a);
  const c = Math.cos(a);
  const rotationMatrix = [ c, 0, -s, 0,
                           0, 1, 0, 0,
                           s, 0, c, 0,
                           0, 0, 0, 1];
  return mTimesT(m, rotationMatrix);
}

function main() {
  let Q = 100; // Coordinate system quadrant size in pixels.

  // 3d animation
  
  // xyz is container for 3D coordinate system.
  let xyz = document.querySelector("#xyz");
  xyz.style.position = "relative";
  xyz.style.width = xyz.style.height = `${Q * 2}px`;
  xyz.style.perspective = "350px";
  
  // Adjust orientation of coordinate system container, and
  // everything in it, so that view won't just be straight down
  // the Z-axis.
  xyz.style.transformStyle = "preserve-3d";
  xyz.style.transform = "rotateX(-15deg) rotateY(20deg)";
  
  // +x +y quadrant (transparent blue).
  let d2 = document.createElement("div");
  xyz.appendChild(d2);
  d2.style.width = d2.style.height = `${Q}px`;
  d2.style.position = "absolute";
  d2.style.left = `${Q}px`;
  d2.style.backgroundColor = "rgba(0, 100, 255, 0.1)";
  d2.style.borderLeft = d2.style.borderBottom = "1px solid black";

  // -x -y quadrant.
  d2 = document.createElement("div");
  xyz.appendChild(d2);
  d2.style.width = d2.style.height = `${Q}px`;
  d2.style.position = "absolute";
  d2.style.top = `${Q}px`;
  d2.style.borderRight = d2.style.borderTop = "1px solid black";

  // +x -z quadrant (transparent blue).  -z is "into the screen."
  d2 = document.createElement("div");
  xyz.appendChild(d2);
  d2.style.width = d2.style.height = `${Q}px`;
  d2.style.position = "absolute";
  d2.style.left = `${Q}px`;
  d2.style.backgroundColor = "rgba(0, 100, 255, 0.1)";
  d2.style.borderLeft = d2.style.borderBottom = "1px solid black";
  d2.style.transformOrigin = `0px ${Q}px 0px`;
  d2.style.transform = "rotateX(90deg)";

  // -x +z quadrant.  +z is "out of the screen," towards the viewer.
  d2 = document.createElement("div");
  xyz.appendChild(d2);
  d2.style.width = d2.style.height = `${Q}px`;
  d2.style.position = "absolute";
  d2.style.top = `${Q}px`;
  d2.style.borderRight = d2.style.borderTop = "1px solid black";
  d2.style.transformOrigin = "100px 0px 0px";
  d2.style.transform = "rotateX(90deg)";

  // A yellow square to move around.
  d2 = document.createElement("div");
  xyz.appendChild(d2);
  d2.style.width = d2.style.height = `${Q * 0.5}px`; // Size of square.
  d2.style.position = "absolute";
  d2.style.left = d2.style.top =
      `${Q * 0.75}px`;  // Offset in xy-plane from coordinate
                        // system top left corner.
  d2.style.backgroundColor = "rgba(255, 220, 0, 0.8)";
  d2.style.border = "1px solid black";

  let d3 = document.createElement("div");
  xyz.appendChild(d3);
  d3.style.width = d3.style.height = `${Q * 0.5}px`; // Size of square.
  d3.style.position = "absolute";
  d3.style.left = d3.style.top =
      `${Q * 0.75}px`;  // Offset in xy-plane from coordinate
                        // system top left corner.
  d3.style.backgroundColor = "rgba(255, 58, 0, 0.8)";
  d3.style.border = "1px solid black";

  let p3d = [2, 3, 0, 1]
  let pDiv3dYellow = document.querySelector("#point3DYellow")
  pDiv3dYellow.innerHTML = matrixHTML(p3d);
  let pDiv3dRed = document.querySelector("#point3DRed")
  pDiv3dRed.innerHTML = matrixHTML(p3d);

  // 3D transformation matrix.
  let m3d= [1, 0, 0, 0,
             0, 1, 0, 0,
             0, 0, 1, 0,
             50, 50, 0, 1];
  let m3dSecond= [1, 0, 0, 0,
             0, 1, 0, 0,
             0, 0, 1, 0,
             50, 50, 0, 1];

  let mDiv3dYellow = document.querySelector("#matrix3DYellow")
  mDiv3dYellow.innerHTML = matrixHTML(m3d);
  let mDiv3dRed= document.querySelector("#matrix3DRed")
  mDiv3dRed.innerHTML = matrixHTML(m3dSecond);
  
  let qDiv3dYellow = document.querySelector("#newPoint3DYellow")
  let qDiv3dRed = document.querySelector("#newPoint3DRed")
  let q3d = pTimesM(p3d, m3d);
  let q3dSecond = pTimesM(p3d, m3dSecond);
  qDiv3dYellow.innerHTML = matrixHTML(q3d);
  qDiv3dRed.innerHTML = matrixHTML(q3dSecond);
  d2.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${m3d})`;
  d3.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${m3d})`;

  // function animate() {
  //   // 2D
  //   m = rotateZ(m, Math.PI / 50);
    
  //   mDiv.innerHTML = matrixHTML(m);
    
  //   let q = pTimesM(p, m);
  //   qDiv.innerHTML = matrixHTML(q);
    
  //   d.style.transform = `scaleY(-1) matrix(${m})`;

  //   // 3D
  //   m3d = rotateY3d(m3d, Math.PI / 50);
  //   mDiv3d.innerHTML = matrixHTML(m3d);

  //   let q3d = pTimesM(p3d, m3d);
  //   qDiv3d.innerHTML = matrixHTML(q3d);


  //   d2.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${m3d})`;

  //   requestAnimationFrame(animate);
  // }

  // requestAnimationFrame(animate);

  function animate(frames, update) {
    return new Promise((resolve) => {
      function a(f) {
        if (f > 0) {
          update();
          requestAnimationFrame(() => { a(--f); });
        } else {
          resolve();
        }
      }

      requestAnimationFrame(() => { a(frames); });
    });
  }

  (async function doThings() {
    await animate(100, () => {}); // pause for 100 frames
    await animate(100, () => {
      m3d = [1, 0, 0, 0,
             0, 1, 0, 0,
             0, 0, 1, 0,
             0, 0, 0, 1];
      m3dSecond = [2, 0, 0, 0,
                   0, 2, 0, 0,
                   0, 0, 2, 0,
                   50, 50, 0, 1];
      mDiv3dYellow.innerHTML = matrixHTML(m3d);
      mDiv3dRed.innerHTML = matrixHTML(m3dSecond);

      let q3d = pTimesM(p3d, m3d);
      let q3dSecond = pTimesM(p3d, m3dSecond);
      qDiv3dYellow.innerHTML = matrixHTML(q3d);
      qDiv3dRed.innerHTML = matrixHTML(q3dSecond);
      d2.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${m3d})`;
      d3.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${m3dSecond})`;
    }); 
    await animate(100, () => {
      m3d = [2, 0, 0, 0,
             0, 2, 0, 0,
             0, 0, 2, 0,
             0, 0, 0, 1];
      m3dSecond = [1, 0, 0, 0,
                   0, 1, 0, 0,
                   0, 0, 1, 0,
                   0, 0, 0, 1];
      mDiv3dYellow.innerHTML = matrixHTML(m3d);
      mDiv3dRed.innerHTML = matrixHTML(m3dSecond);

      let q3d = pTimesM(p3d, m3d);
      let q3dSecond = pTimesM(p3d, m3dSecond);
      qDiv3dYellow.innerHTML = matrixHTML(q3d);
      qDiv3dRed.innerHTML = matrixHTML(q3dSecond);
      d2.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${m3d})`;
      d3.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${m3dSecond})`;
    });
    await animate(100, () => {
      m3d = [2, 0, 0, 0,
             0, 2, 0, 0,
             0, 0, 2, 0,
             50, 50, 0, 1];
      m3dSecond = [2, 0, 0, 0,
                   0, 2, 0, 0,
                   0, 0, 2, 0,
                   0, 0, 0, 1];
      mDiv3dYellow.innerHTML = matrixHTML(m3d);
      mDiv3dRed.innerHTML = matrixHTML(m3dSecond);

      let q3d = pTimesM(p3d, m3d);
      let q3dSecond = pTimesM(p3d, m3dSecond);
      qDiv3dYellow.innerHTML = matrixHTML(q3d);
      qDiv3dRed.innerHTML = matrixHTML(q3dSecond);
      d2.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${m3d})`;
      d3.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${m3dSecond})`;
    });
  })();
}

window.onload = main;
