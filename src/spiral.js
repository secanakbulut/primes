// ulam spiral.
// walk: right 1, up 1, left 2, down 2, right 3, up 3, left 4, down 4, ...
// at each step we know which integer N we are on, and (x,y) tells us where to plot.

const SpiralView = (() => {
  let canvas, ctx;
  let lastN = 0;
  let lastSide = 0;
  let lastCell = 0;
  let lastPrimes = null; // sieve array
  // grid mapping: cell coordinates relative to center -> integer at that cell
  // for hover we need the reverse, so we recompute on the fly using formula

  function init(c) {
    canvas = c;
    ctx = c.getContext("2d");
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", () => setReadout("hover the canvas"));
  }

  function setReadout(text) {
    const r = document.getElementById("spiralReadout");
    if (r) r.textContent = text;
  }

  function draw(n) {
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = "#08080a";
    ctx.fillRect(0, 0, w, h);

    // pick a square side that fits N. side x side cells.
    const side = Math.ceil(Math.sqrt(n));
    const sideOdd = side % 2 === 0 ? side + 1 : side; // keep it odd so center is a real cell
    const cell = Math.floor(Math.min(w, h) / sideOdd);
    if (cell < 1) {
      ctx.fillStyle = "#888";
      ctx.font = "13px monospace";
      ctx.fillText("N too large to draw at this size", 20, 30);
      return;
    }

    const primes = sieve(n);
    lastPrimes = primes;
    lastN = n;
    lastSide = sideOdd;
    lastCell = cell;

    // origin: center of canvas, where N=1 sits
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    // walk the spiral
    let x = 0, y = 0;
    let dx = 1, dy = 0;
    let segLen = 1;
    let stepsInSeg = 0;
    let segsAtThisLen = 0;

    for (let k = 1; k <= n; k++) {
      if (primes[k]) {
        // map (x,y) to pixel; y axis flipped so up is up
        const px = cx + x * cell;
        const py = cy - y * cell;
        // intensity: bigger for smaller primes is silly, just use a soft color
        ctx.fillStyle = "#d4a017";
        ctx.fillRect(px - cell / 2, py - cell / 2, cell, cell);
      }

      // step
      x += dx; y += dy;
      stepsInSeg++;
      if (stepsInSeg === segLen) {
        stepsInSeg = 0;
        // turn left: (dx,dy) -> (-dy,dx)
        const ndx = -dy, ndy = dx;
        dx = ndx; dy = ndy;
        segsAtThisLen++;
        if (segsAtThisLen === 2) {
          segsAtThisLen = 0;
          segLen++;
        }
      }
    }

    // mark the center cell (1)
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - cell / 2, cy - cell / 2, cell, cell);
  }

  // figure out which N is at a given (x,y) cell offset.
  // formula: for integer ring r = max(|x|,|y|), the bottom-right corner is (2r+1)^2.
  // we walk the ring's perimeter back from there.
  function indexAt(x, y) {
    if (x === 0 && y === 0) return 1;
    const r = Math.max(Math.abs(x), Math.abs(y));
    const brCorner = (2 * r + 1) * (2 * r + 1); // bottom-right corner value
    // sides relative to bottom-right, going counter-clockwise around the ring.
    // bottom-right at (r, -r). going up the right side: x=r, y from -r+1 to r.
    // then top: y=r, x from r-1 down to -r.
    // then left: x=-r, y from r-1 down to -r.
    // then bottom: y=-r, x from -r+1 to r-1.
    // but with our spiral that starts going right, the value at (r,-r) is (2r-1)^2 + 1? not quite.
    // easier: derive by walking the last ring from previous square.
    // last ring fully complete at (2r+1)^2 sitting at (r, -r).
    // going backwards along the ring:
    //   bottom side from (r,-r) to (-r+1,-r): values (2r+1)^2 down to (2r+1)^2 - (2r-1)
    // this gets fiddly. take an explicit approach: compute by ring side.
    // ref formula (kinda standard): see notes in readme.
    const sideLen = 2 * r;
    if (y === -r && x > -r) {
      // bottom row, value goes up as x decreases from r
      return brCorner - (r - x);
    }
    if (x === -r) {
      // left column, value goes up as y increases from -r
      return brCorner - sideLen - (r + y);
    }
    if (y === r) {
      // top row, value goes up as x increases from -r
      return brCorner - 2 * sideLen - (r + x);
    }
    // right column (x === r), value goes up as y decreases from r toward -r+1
    return brCorner - 3 * sideLen - (r - y);
  }

  function onMove(ev) {
    if (!lastCell) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (ev.clientX - rect.left) * (canvas.width / rect.width);
    const sy = (ev.clientY - rect.top) * (canvas.height / rect.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const gx = Math.round((sx - cx) / lastCell);
    const gy = Math.round((cy - sy) / lastCell);
    const r = Math.max(Math.abs(gx), Math.abs(gy));
    if (r > Math.floor(lastSide / 2)) {
      setReadout("");
      return;
    }
    const n = indexAt(gx, gy);
    if (n < 1 || n > lastN) {
      setReadout(`N ${n} (out of range)`);
      return;
    }
    const prime = lastPrimes && lastPrimes[n] === 1;
    setReadout(`N ${n} ${prime ? "(prime)" : ""}`);
  }

  return { init, draw };
})();
