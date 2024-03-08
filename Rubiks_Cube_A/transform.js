// Jamie Padovano
export default class Transform {

  constructor() {
    // Create array instance variable representing 4x4
    // transformation matrix.  Start with identity matrix.
    this.transformationMatrix = [ 1, 0, 0, 0,
                                  0, 1, 0, 0,
                                  0, 0, 1, 0,
                                  0, 0, 0, 1 ];
    
    // Create array instance variable for stack, for
    // push and pop methods.  Start with empty array.
    this.stackArray = [];
  }
  
  push() {
    // Push copy of current transformation matrix.
    this.stackArray.push(this.transformationMatrix);
  }
  
  pop() {
    // Pop transformation matrix from stack, overwrite
    // current transformation matrix with the one that
    // was popped.
    this.transformationMatrix = this.stackArray.pop();
  }
  
  translate(tx, ty, tz) {
    // Multiply current transformation matrix by matrix
    // representing translation by tx, ty, tz.  (Overwrite
    // current transformation matrix with the result.)
    const t = this.transformationMatrix;
    this.transformationMatrix = [ t[0], t[1], t[2], t[0] * tx + t[1] * ty + t[2] * tz + t[3],
                                  t[4], t[5], t[6], t[4] * tx + t[5] * ty + t[6] * tz + t[7],
                                  t[8], t[9], t[10], t[8] * tx + t[9] * ty + t[10] * tz + t[11],
                                  t[12], t[13], t[14], t[12] * tx + t[13] * ty + t[14] * tz + t[15] ];
    return this;
  }
  
  scale(sx, sy, sz) {
    // Multiply current transformation matrix by matrix
    // representing scale by sx, sy, sz.  (Overwrite current
    // transformation matrix with the result.)
    const t = this.transformationMatrix;
    this.transformationMatrix = [ t[0] * sx, t[1] * sy, t[2] * sz, t[3],
                                  t[4] * sx, t[5] * sy, t[6] * sz, t[7],
                                  t[8] * sx, t[9] * sy, t[10] * sz, t[11],
                                  t[12] * sx, t[13] * sy, t[14] * sz, t[15] ];
    return this;
  }
  
  rotate(angle, axis) {
    // Multiply current transformation matrix by matrix
    // representing coordinate axis rotation (axis argument
    // should be "X", "Y" or "Z") by given angle (in degrees).
    // (Overwrite current transformation matrix with the result.)
    angle = angle * (Math.PI / 180);
    let s = Math.sin(angle);
    let c = Math.cos(angle);
    let rotationMatrix = [];
    if (axis.toLowerCase() == "x") {
      rotationMatrix = [ 1, 0, 0, 0,
                         0, c, -s, 0,
                         0, s, c, 0,
                         0, 0, 0, 1 ];
    } else if (axis.toLowerCase() == "y") {
      rotationMatrix = [ c, 0, s, 0,
                         0, 1, 0, 0,
                         -s, 0, c, 0,
                         0, 0, 0, 1 ];
    } else if (axis.toLowerCase() == "z") {
      rotationMatrix = [ c, -s, 0, 0,
                         s, c, 0, 0,
                         0, 0, 1, 0,
                         0, 0, 0, 1 ];
    }
    const [ m0, m1, m2, m3,
            m4, m5, m6, m7,
            m8, m9, m10, m11,
            m12, m13, m14, m15 ] = rotationMatrix;
    const [ t0, t1, t2, t3,
            t4, t5, t6, t7,
            t8, t9, t10, t11,
            t12, t13, t14, t15 ] = this.transformationMatrix;
    this.transformationMatrix = [ t0 * m0 + t1 * m4 + t2 * m8 + t3 * m12,
                                  t0 * m1 + t1 * m5 + t2 * m9 + t3 * m13,
                                  t0 * m2 + t1 * m6 + t2 * m10 + t3 * m14,
                                  t0 * m3  + t1 * m7 + t2 * m11 + t3 * m15,
                                  
                                  t4 * m0 + t5 * m4 + t6 * m8 + t7 * m12,
                                  t4 * m1 + t5 * m5 + t6 * m9 + t7 * m13,
                                  t4 * m2 + t5 * m6 + t6 * m10 + t7 * m14,
                                  t4 * m3  + t5 * m7 + t6 * m11 + t7 * m15,
                                  
                                  t8 * m0 + t9 * m4 + t10 * m8 + t11 * m12,
                                  t8 * m1 + t9 * m5 + t10 * m9 + t11 * m13,
                                  t8 * m2 + t9 * m6 + t10 * m10 + t11 * m14,
                                  t8 * m3  + t9 * m7 + t10 * m11 + t11 * m15,
                                  
                                  t12 * m0 + t13 * m4 + t14 * m8 + t15 * m12,
                                  t12 * m1 + t13 * m5 + t14 * m9 + t15 * m13,
                                  t12 * m2 + t13 * m6 + t14 * m10 + t15 * m14,
                                  t12 * m3  + t13 * m7 + t14 * m11 + t15 * m15];
      return this;
  }
  
  frustum(right, top, near, far) {
    // Multiply current transformation matrix by matrix
    // representing perspective normalization transformation using
    // parameters right, top, near and far.  (Overwrite current
    // transformation matrix with the result.)
    const a = (near + far)/(near - far);
    const b = (2 * near * far)/(near - far);
    const perspectiveMatrix = [ (near / right), 0, 0, 0,
                                0, (near / top), 0, 0,
                                0, 0, a, b,
                                0, 0, -1, 0 ];
    const [ m0, m1, m2, m3,
            m4, m5, m6, m7,
            m8, m9, m10, m11,
            m12, m13, m14, m15 ] = perspectiveMatrix;
    const [ t0, t1, t2, t3,
            t4, t5, t6, t7,
            t8, t9, t10, t11,
            t12, t13, t14, t15 ] = this.transformationMatrix;

    this.transformationMatrix = [ t0 * m0 + t1 * m4 + t2 * m8 + t3 * m12,
                                  t0 * m1 + t1 * m5 + t2 * m9 + t3 * m13,
                                  t0 * m2 + t1 * m6 + t2 * m10 + t3 * m14,
                                  t0 * m3  + t1 * m7 + t2 * m11 + t3 * m15,
                                  
                                  t4 * m0 + t5 * m4 + t6 * m8 + t7 * m12,
                                  t4 * m1 + t5 * m5 + t6 * m9 + t7 * m13,
                                  t4 * m2 + t5 * m6 + t6 * m10 + t7 * m14,
                                  t4 * m3  + t5 * m7 + t6 * m11 + t7 * m15,
                                  
                                  t8 * m0 + t9 * m4 + t10 * m8 + t11 * m12,
                                  t8 * m1 + t9 * m5 + t10 * m9 + t11 * m13,
                                  t8 * m2 + t9 * m6 + t10 * m10 + t11 * m14,
                                  t8 * m3  + t9 * m7 + t10 * m11 + t11 * m15,
                                  
                                  t12 * m0 + t13 * m4 + t14 * m8 + t15 * m12,
                                  t12 * m1 + t13 * m5 + t14 * m9 + t15 * m13,
                                  t12 * m2 + t13 * m6 + t14 * m10 + t15 * m14,
                                  t12 * m3  + t13 * m7 + t14 * m11 + t15 * m15];
      return this;
  }
}

