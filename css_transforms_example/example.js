"use strict";

function main() {

  // This version assumes there's an element with id "square"
  // in the .html file, as well as style settings for that
  // element in the .css file.
  // let square = document.querySelector("#square");
  
  // This version creates a new "square" element and adds
  // style settings for it.
  let square = document.createElement("div");
  document.querySelector("body").appendChild(square);
  square.style.width = square.style.height = "150px";
  square.style["background-color"] = "rgb(250, 200, 120)";
  square.style["padding-top"] = "10px";
  square.style["text-align"] = "center";
  square.innerHTML = "Hello, World!";
  
  square.style["transform-origin"] = "center center 0";
  
  let frameCount = 0;
  
  function animate() {
    let angle = 100 * Math.sin(frameCount / 60);
    square.style["transform"] = "rotate(" + angle + "deg)";
    frameCount++;
    
    requestAnimationFrame(animate);
  }
  
  requestAnimationFrame(animate);
}

window.onload = main;