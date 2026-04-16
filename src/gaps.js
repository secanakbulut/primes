// prime gaps plot. x = index of the prime, y = gap to next prime.

const GapsView = (() => {
  let canvas, ctx;

  function init(c) {
    canvas = c;
    ctx = c.getContext("2d");
  }

  function draw(n) {
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = "#08080a";
    ctx.fillRect(0, 0, w, h);

    const ps = primesUpTo(n);
    if (ps.length < 2) return;

    const gaps = [];
    let maxGap = 0;
    let maxGapAt = 0;
    for (let i = 0; i < ps.length - 1; i++) {
      const g = ps[i + 1] - ps[i];
      gaps.push(g);
      if (g > maxGap) { maxGap = g; maxGapAt = ps[i]; }
    }

    const padL = 36, padR = 12, padT = 14, padB = 24;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // axes
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // plot. one pixel per gap when there are many, else thin bars.
    const xStep = plotW / gaps.length;
    for (let i = 0; i < gaps.length; i++) {
      const g = gaps[i];
      const px = padL + i * xStep;
      const ph = (g / maxGap) * plotH;
      const py = padT + plotH - ph;
      ctx.fillStyle = (g === maxGap) ? "#e85d5d" : "#d4a017";
      ctx.fillRect(px, py, Math.max(1, xStep), ph);
    }

    // labels
    ctx.fillStyle = "#666";
    ctx.font = "11px monospace";
    ctx.fillText("gap", 4, padT + 10);
    ctx.fillText(String(maxGap), 4, padT + 24);
    ctx.fillText("0", 22, padT + plotH);
    ctx.fillText(`primes up to ${n} (${ps.length} of them)`, padL, h - 6);

    // stats below
    const stats = document.getElementById("gapsStats");
    if (stats) {
      stats.innerHTML =
        `count <b>${ps.length}</b>` +
        ` &nbsp; longest gap <b>${maxGap}</b>` +
        ` &nbsp; after prime <b>${maxGapAt}</b>`;
    }
  }

  return { init, draw };
})();
