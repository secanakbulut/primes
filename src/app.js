// glue: tabs + factor panel.

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupFactor();
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
