// glue: tabs + spiral + sieve animation + factor.

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupSpiral();
  setupSieve();
  setupFactor();
  setupGaps();
});

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");
  tabs.forEach(t => {
    t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      t.classList.add("active");
      document.getElementById("tab-" + t.dataset.tab).classList.add("active");
    });
  });
}

function setupSpiral() {
  const canvas = document.getElementById("spiralCanvas");
  SpiralView.init(canvas);

  const slider = document.getElementById("spiralN");
  const val = document.getElementById("spiralNVal");
  const draw = document.getElementById("spiralDraw");

  slider.addEventListener("input", () => { val.textContent = slider.value; });
  draw.addEventListener("click", () => {
    SpiralView.draw(parseInt(slider.value, 10));
  });

  SpiralView.draw(parseInt(slider.value, 10));
}

function setupSieve() {
  const canvas = document.getElementById("sieveCanvas");
  const ctx = canvas.getContext("2d");
  const slider = document.getElementById("sieveN");
  const val = document.getElementById("sieveNVal");
  const speed = document.getElementById("sieveSpeed");
  const status = document.getElementById("sieveStatus");
  const startBtn = document.getElementById("sieveStart");
  const stepBtn = document.getElementById("sieveStep");
  const resetBtn = document.getElementById("sieveReset");

  let state = null;

  function reset() {
    const n = parseInt(slider.value, 10);
    state = {
      n,
      marks: new Uint8Array(n + 1), // 0 = unmarked, 1 = prime, 2 = crossed
      p: 2,
      multiple: 4,
      done: false,
      running: false,
    };
    state.marks[0] = 2;
    state.marks[1] = 2;
    state.marks[2] = 1;
    paint();
    status.textContent = `ready. N = ${n}.`;
  }

  function paint() {
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = "#08080a";
    ctx.fillRect(0, 0, w, h);
    const n = state.n;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const cell = Math.floor(Math.min(w / cols, h / rows));
    const offX = Math.floor((w - cols * cell) / 2);
    const offY = Math.floor((h - rows * cell) / 2);

    for (let i = 1; i <= n; i++) {
      const row = Math.floor((i - 1) / cols);
      const col = (i - 1) % cols;
      const px = offX + col * cell;
      const py = offY + row * cell;
      const m = state.marks[i];
      if (m === 1) ctx.fillStyle = "#d4a017";
      else if (m === 2) ctx.fillStyle = "#222";
      else ctx.fillStyle = "#444";
      ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);

      if (i === state.p && !state.done) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, cell - 1, cell - 1);
      }
      if (i === state.multiple && !state.done) {
        ctx.strokeStyle = "#e85d5d";
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, cell - 1, cell - 1);
      }
    }
  }

  function stepOnce() {
    if (state.done) return;
    const { n } = state;
    if (state.p * state.p > n) {
      for (let i = 2; i <= n; i++) {
        if (state.marks[i] === 0) state.marks[i] = 1;
      }
      state.done = true;
      state.running = false;
      status.textContent = `done. p^2 > N.`;
      paint();
      return;
    }

    if (state.multiple <= n) {
      if (state.marks[state.multiple] !== 1) {
        state.marks[state.multiple] = 2;
      }
      state.multiple += state.p;
      status.textContent = `prime ${state.p}, crossing multiples`;
    } else {
      let np = state.p + 1;
      while (np <= n && state.marks[np] === 2) np++;
      if (np > n) {
        state.done = true;
        state.running = false;
        status.textContent = "done.";
      } else {
        state.p = np;
        state.marks[np] = 1;
        state.multiple = np * np;
        status.textContent = `next prime: ${np}`;
      }
    }
    paint();
  }

  function loop() {
    if (!state.running || state.done) return;
    const sp = parseInt(speed.value, 10);
    for (let i = 0; i < sp; i++) {
      if (state.done) break;
      stepOnce();
    }
    requestAnimationFrame(loop);
  }

  slider.addEventListener("input", () => {
    val.textContent = slider.value;
    reset();
  });
  startBtn.addEventListener("click", () => {
    if (state.done) reset();
    state.running = !state.running;
    startBtn.textContent = state.running ? "pause" : "start";
    if (state.running) loop();
  });
  stepBtn.addEventListener("click", () => {
    state.running = false;
    startBtn.textContent = "start";
    stepOnce();
  });
  resetBtn.addEventListener("click", () => {
    reset();
    startBtn.textContent = "start";
  });

  reset();
}

function setupFactor() {
  const inp = document.getElementById("factorIn");
  const btn = document.getElementById("factorGo");
  const out = document.getElementById("factorOut");

  function run() {
    const r = factorize(inp.value);
    if (r.error) {
      out.innerHTML = `<span class="label">error</span><div class="pretty">${r.error}</div>`;
      return;
    }
    const pretty = prettyFactorString(r.grouped);
    const flat = r.factors.map(b => b.toString()).join(" * ");
    const isPrime = r.factors.length === 1;
    out.innerHTML =
      `<span class="label">n</span><div class="pretty">${inp.value.trim()}</div>` +
      `<div style="height:8px"></div>` +
      `<span class="label">factorization</span>` +
      `<div class="factors">${pretty || "(prime)"}</div>` +
      (r.factors.length > 1 ? `<div class="pretty">${flat}</div>` : "") +
      (isPrime ? `<div class="pretty">${inp.value.trim()} is prime.</div>` : "") +
      `<div class="timing">${r.elapsed.toFixed(1)} ms</div>`;
  }

  btn.addEventListener("click", run);
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
  run();
}

function setupGaps() {
  const canvas = document.getElementById("gapsCanvas");
  GapsView.init(canvas);
  const slider = document.getElementById("gapsN");
  const val = document.getElementById("gapsNVal");
  const btn = document.getElementById("gapsDraw");

  slider.addEventListener("input", () => { val.textContent = slider.value; });
  btn.addEventListener("click", () => {
    GapsView.draw(parseInt(slider.value, 10));
  });

  GapsView.draw(parseInt(slider.value, 10));
}
