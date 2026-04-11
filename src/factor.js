// trial division factorization. handles up to ~10^14 in reasonable time.
// uses BigInt internally so we don't lose precision on the bigger end.

function factorize(nStr) {
  let n;
  try {
    n = BigInt(nStr.toString().trim());
  } catch (e) {
    return { error: "not a valid integer" };
  }
  if (n < 2n) return { error: "give me something >= 2" };

  const factors = [];
  const start = performance.now();

  // pull out 2s and 3s first so the main loop can step by 6
  while (n % 2n === 0n) { factors.push(2n); n /= 2n; }
  while (n % 3n === 0n) { factors.push(3n); n /= 3n; }

  let k = 5n;
  // 6k +/- 1 wheel
  while (k * k <= n) {
    while (n % k === 0n) { factors.push(k); n /= k; }
    const k2 = k + 2n;
    while (n % k2 === 0n) { factors.push(k2); n /= k2; }
    k += 6n;
  }
  if (n > 1n) factors.push(n);

  const elapsed = performance.now() - start;

  // group into prime^exponent form
  const grouped = [];
  for (const f of factors) {
    const last = grouped[grouped.length - 1];
    if (last && last.p === f) last.e++;
    else grouped.push({ p: f, e: 1 });
  }

  return { factors, grouped, elapsed };
}

function prettyFactorString(grouped) {
  return grouped
    .map(({ p, e }) => (e === 1 ? p.toString() : `${p}^${e}`))
    .join(" * ");
}
