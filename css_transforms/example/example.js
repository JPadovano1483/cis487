// Jamie Padovano

"use strict";

class Square {
  constructor(direction = "horizontal", color = "blue", size = "50px") {
    this.div = document.createElement("div");
    document.querySelector("body").appendChild(this.div);
    this.div.className = direction;
    this.div.style.width = this.div.style.height = this.div.style.zIndex = size;
    this.div.style.backgroundColor = color;

    // make speed scale with square size - bigger = faster
    const speed = 17 - Math.floor((parseInt(size) / 230) * 13);
    this.div.style.animationDuration = speed + "s";
    
    const xPos = Math.random() * window.innerWidth;
    const yPos = Math.random() * window.innerHeight;
    if (direction == "horizontal") this.div.style.top = `${yPos}px`;
    else this.div.style.left = `${xPos}px`;
  }
}

function main() {
  let squares = [];
  const colorList = ["red", "orange", "yellow", "green", "blue", "purple"];

  setInterval(() => {
    const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
    const color = colorList[Math.floor(Math.random() * colorList.length)];
    const size = Math.random() * 200 + 30 + "px";

    squares.push(new Square(direction, color, size));
  }, 200)
}

window.onload = main;
