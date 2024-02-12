"use strict";

function main() {
  const h = document.querySelector("#hello");
  h.style.position = "fixed";
  h.y = 10;

  /*
  function animate() {
    h.style.top = `${h.y++}px`;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
  */

  /*
  function animate(frames) {
    if (frames > 0) {
      h.style.top = `${h.y++}px`;
      requestAnimationFrame(() => { animate(--frames); });
    }
  }

  requestAnimationFrame(() => { animate(100); });
  */

  /*
  function animate(frames, callback) {

    function a(f) {
      if (f > 0) {
        h.style.top = `${h.y++}px`;
        requestAnimationFrame(() => { a(--f); });
      } else {
        callback();
      }
    }

    requestAnimationFrame(() => a(frames));
  }

  function pause(frames, callback) {
    
    function a(f) {
      if (f > 0) requestAnimationFrame(() => { a(--f); });
      else callback();
    }

    requestAnimationFrame(() => a(frames));
  }

  animate(100, () => {
    pause(100, () => {
      animate(100, () => {
        pause(100, () => {
          animate(100, () => {
            console.log("done");
          });
        });
      });
    });
  });
  */

  /*
  function animate(frames) {
    return new Promise((resolve) => {
      function a(f) {
        if (f > 0) {
          h.style.top = `${h.y++}px`;
          requestAnimationFrame(() => { a(--f); });
        } else {
          resolve();
        }
      }

      requestAnimationFrame(() => { a(frames); });
    });
  }

  function pause(frames) {
    return new Promise((resolve) => {
      function p(f) {
        if (f > 0) requestAnimationFrame(() => { p(--f); });
        else resolve();
      }

      requestAnimationFrame(() => { p(frames); });
    })
  }

  (async function doThings() {
    await animate(100);
    await pause(100);
    await animate(100);
  })();
  */

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
    await animate(100, () => { h.style.top = `${h.y++}px`; });
    await animate(100, () => {}); // pause for 100 frames
    await animate(100, () => { h.style.top = `${h.y--}px`; });
  })();

  /*
  function animate(frames, update) {
    function a(f, update, callback) {
      if (f > 0) {
        update();
        requestAnimationFrame(() => { a(--f, update, callback); });
      } else {
        callback();
      }
    }

    return new Promise((resolve) => {
      requestAnimationFrame(() => { a(frames, update, resolve); });
    });
  }

  (async function doThings() {
    await animate(100, () => { h.style.top = `${h.y++}px`; });
    await animate(100, () => {}); // pause for 100 frames
    await animate(100, () => { h.style.top = `${h.y--}px`; });
  })();
  */
}

window.onload = main;