// sieve of eratosthenes
// returns a typed array where 1 = prime, 0 = composite (indices 0,1 forced to 0).

function sieve(n) {
  const a = new Uint8Array(n + 1);
  for (let i = 2; i <= n; i++) a[i] = 1;
  const lim = Math.floor(Math.sqrt(n));
  for (let i = 2; i <= lim; i++) {
    if (!a[i]) continue;
    for (let j = i * i; j <= n; j += i) a[j] = 0;
  }
  return a;
}

// list of primes up to n
function primesUpTo(n) {
  const s = sieve(n);
  const out = [];
  for (let i = 2; i <= n; i++) if (s[i]) out.push(i);
  return out;
}

// quick is-prime for the spiral hover. trial division, fine for the sizes here.
function isPrimeSmall(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  const lim = Math.floor(Math.sqrt(n));
  for (let k = 3; k <= lim; k += 2) {
    if (n % k === 0) return false;
  }
  return true;
}
