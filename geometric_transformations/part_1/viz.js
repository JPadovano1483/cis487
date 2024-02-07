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

function main() {
  let Q = 100; // Coordinate system quadrant size in pixels.

  let p = [2, 3, 1];
  let pDiv = document.querySelector("#point2D");
  pDiv.innerHTML = matrixHTML(p);

  
  // 2D transformation matrix.
  let m = [ 2, 0,
    0, 1,
    0, 3 ];
    let mDiv = document.querySelector("#matrix2D");
    mDiv.innerHTML = matrixHTML(m);

  let q = pTimesM(p, m);
  let qDiv = document.querySelector("#newPoint2D");
  qDiv.innerHTML = matrixHTML(q);

  // xy is container for 2D coordinate system.
  let xy = document.querySelector("#xy");
  xy.style.position = "relative";
  xy.style.width = xy.style.height = `${Q * 2}px`;

  // Upper right quadrant (transparent blue).
  let d = document.createElement("div");
  xy.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.left = `${Q}px`;
  d.style.backgroundColor = "rgba(0, 100, 255, 0.1)";
  d.style.borderLeft = d.style.borderBottom = "1px solid black";

  // Lower left quadrant.
  d = document.createElement("div");
  xy.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.top = `${Q}px`;
  d.style.borderRight = d.style.borderTop = "1px solid black";
  
  // A yellow square to move around.
  d = document.createElement("div");
  xy.appendChild(d);
  d.style.width = d.style.height = `${Q * 0.5}px`; // Size of square.
  d.style.position = "absolute";
  d.style.left = d.style.top =
      `${Q * 0.75}px`;  // Offset from coordinate system top
                        // left corner.
  d.style.backgroundColor = "rgba(255, 220, 0, 0.8)";
  d.style.border = "1px solid black";

  // Apply 2D transformation represented by values in matrix m
  // to the yellow square (after flipping Y-axis to point upward).
  d.style.transform = `scaleY(-1) matrix(${m})`;

  // 3D transformation matrix.
  m = [ 1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1 ];
  mDiv = document.querySelector("#matrix3D");
  mDiv.innerHTML = matrixHTML(m);
  
  // xyz is container for 3D coordinate system.
  let xyz = document.querySelector("#xyz");
  xyz.style.position = "relative";
  xyz.style.width = xy.style.height = `${Q * 2}px`;
  xyz.style.perspective = "350px";
  
  // Adjust orientation of coordinate system container, and
  // everything in it, so that view won't just be straight down
  // the Z-axis.
  xyz.style.transformStyle = "preserve-3d";
  xyz.style.transform = "rotateX(-15deg) rotateY(20deg)";
  
  // +x +y quadrant (transparent blue).
  d = document.createElement("div");
  xyz.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.left = `${Q}px`;
  d.style.backgroundColor = "rgba(0, 100, 255, 0.1)";
  d.style.borderLeft = d.style.borderBottom = "1px solid black";

  // -x -y quadrant.
  d = document.createElement("div");
  xyz.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.top = `${Q}px`;
  d.style.borderRight = d.style.borderTop = "1px solid black";

  // +x -z quadrant (transparent blue).  -z is "into the screen."
  d = document.createElement("div");
  xyz.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.left = `${Q}px`;
  d.style.backgroundColor = "rgba(0, 100, 255, 0.1)";
  d.style.borderLeft = d.style.borderBottom = "1px solid black";
  d.style.transformOrigin = `0px ${Q}px 0px`;
  d.style.transform = "rotateX(90deg)";

  // -x +z quadrant.  +z is "out of the screen," towards the viewer.
  d = document.createElement("div");
  xyz.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.top = `${Q}px`;
  d.style.borderRight = d.style.borderTop = "1px solid black";
  d.style.transformOrigin = "100px 0px 0px";
  d.style.transform = "rotateX(90deg)";

  // A yellow square to move around.
  d = document.createElement("div");
  xyz.appendChild(d);
  d.style.width = d.style.height = `${Q * 0.5}px`; // Size of square.
  d.style.position = "absolute";
  d.style.left = d.style.top =
      `${Q * 0.75}px`;  // Offset in xy-plane from coordinate
                        // system top left corner.
  d.style.backgroundColor = "rgba(255, 220, 0, 0.8)";
  d.style.border = "1px solid black";

  // Apply 3D transformation represented by values in matrix m
  // to the yellow square (after flipping Y-axis to point upward
  // and bringing square slightly forward, so that when it's in
  // the xy-plane it appears slightly in front of the axes).
  d.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${m})`;
}

window.onload = main;
