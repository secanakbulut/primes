# primes

Four small visual tools for prime numbers. No build step, no dependencies, just a html file and some canvas drawing.

I have always liked the Ulam spiral, the way primes seem to pile onto diagonals when you wind the integers into a square. So I built that, and then it felt natural to bolt on the other things people usually want when they start poking at primes: a sieve, a factorizer, and a gap plot.

## What is in it

Four tabs.

- **Ulam spiral.** Slider for max N (up to 250000). The spiral is drawn cell by cell, primes lit up. Hover the canvas and the readout tells you which integer is under your cursor and whether it is prime. The diagonal pattern shows up best around N = 40000 to 100000.
- **Sieve of Eratosthenes.** Animated. Pick N, hit start, watch each prime get picked and its multiples crossed off. There is a step button if you want to walk one move at a time, and a speed slider for when you want to watch a few thousand cells fall.
- **Factorize.** Type a number, get its prime factorization. Trial division with the 6k +/- 1 wheel. Handles up to 10^14 in a few hundred milliseconds. Uses BigInt so big inputs do not lose precision.
- **Prime gaps.** Plot of g_i = p_(i+1) - p_i as a bar per gap. Longest gap below N is highlighted in red. With N around 100k you can see how the gaps spread out as primes thin out.

## The math, briefly

**Sieve of Eratosthenes.** Make an array of size N+1, mark everything from 2 onward as candidate. Walk i from 2 to sqrt(N). For each i still marked, cross off i*i, i*i+i, i*i+2i, ... up to N. What survives is prime. The starting at i*i is the standard speedup, smaller multiples were already crossed off by smaller primes.

**Ulam spiral coordinates.** Start at N=1 in the center, go right one, turn left, go up one, turn left, go left two, turn left, go down two, turn left, go right three, ... In code: hold (dx,dy), keep a current segment length, take that many steps, then rotate (dx,dy) by 90 degrees counter-clockwise. After every two segments, segment length grows by one. To go the other way, given a cell (x,y), let r = max(|x|, |y|). The bottom-right corner of ring r holds (2r+1)^2. From there you can subtract along the four sides of the ring to get the integer at any (x,y). That is what the hover uses.

**Trial division.** To factor n, peel off small primes (2, 3) first so the main loop can step k by 6 (testing k and k+2). Loop while k*k <= n, dividing as many times as the factor goes. Whatever is left over at the end, if greater than 1, is the last prime factor. Slow for huge numbers but fine for 10^14 and below.

**Prime gaps.** Sieve up to N, list the primes in order, take consecutive differences. The longest gap up to 10^6 is 148 (between 492113 and 492227). Below 10^5 it is 72.

## Run it

```
git clone https://github.com/secanakbulut/primes.git
cd primes
open index.html
```

That is it. No npm, no bundler, just open the file.

## Files

- `index.html` layout and tab markup
- `style.css` dark-ish theme
- `src/sieve.js` sieve and prime helpers
- `src/factor.js` BigInt trial division
- `src/spiral.js` ulam spiral draw and hover lookup
- `src/gaps.js` gap plot
- `src/app.js` tabs, sieve animation, glue

## Notes

The sieve animation caps at N = 2500 because beyond that the cells get too small to follow visually. The actual sieve algorithm in `sieve.js` is fine for much larger N, the gap plot uses it up to 500k.

The spiral cell size is computed from the canvas, so very large N just paints single pixels per cell. That is still pretty.

## License

PolyForm Noncommercial 1.0.0. Source is here, do whatever you like for personal or non-commercial use, ping me before using it for anything commercial. Full text in `LICENSE`.
