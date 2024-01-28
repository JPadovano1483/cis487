"use strict";

class Square {
  constructor() {
    this.div = document.createElement("div");
    document.querySelector("body").appendChild(this.div);
    this.div.style.width = this.div.style.height = "150px";
    this.div.style.backgroundColor = "rgb(250, 200, 120)";
    this.div.style.paddingTop = "10px";
    this.div.style.textAlign = "center";
    this.div.innerHTML = "Hello, World!";
    
    this.div.style.transformOrigin = "center center 0";
  }

  updateTransform(frameCount) {
    const angle = 100 * Math.sin(frameCount / 60);
    this.div.style.transform = "rotate(" + angle + "deg)";
  }
}

function main() {
  let squares = [ new Square(), new Square(), new Square()];
  let frameCount = 0;
  
  function animate() {
    squares.forEach(s => s.updateTransform(frameCount));
    frameCount++;
    
    requestAnimationFrame(animate);
  }
  
  requestAnimationFrame(animate);
}

window.onload = main;