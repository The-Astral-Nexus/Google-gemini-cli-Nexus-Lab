/**
 * Kailos CCRB-8 experimental integration.
 *
 * Canonical binding:
 *   z_t = normalize(Re(IFFT(product_i FFT(E_i))))
 *
 * This runs inside the Gemini CLI application/runtime. It does NOT modify
 * Gemini's proprietary transformer weights. When enabled, the representation
 * is injected into the Gemini request as experimental system context.
 */

export const KAILOS_ROLES = [
  'Concept', 'Context', 'Time', 'Source',
  'State', 'Action', 'Outcome', 'Valence',
] as const;

export type KailosRole = (typeof KAILOS_ROLES)[number];
export const KAILOS_DIMENSION = 4096;

interface Complex { re: number; im: number }

function normalizeL2(v: number[]): number[] {
  const norm = Math.hypot(...v);
  if (!Number.isFinite(norm) || norm < 1e-12) {
    throw new Error('Cannot normalize a near-zero vector.');
  }
  return v.map((x) => x / norm);
}

function fft(input: Complex[], inverse = false): Complex[] {
  const n = input.length;
  if (n === 0 || (n & (n - 1)) !== 0) {
    throw new Error(`FFT dimension must be a power of two; got ${n}.`);
  }

  const out = input.map((x) => ({re: x.re, im: x.im}));
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) [out[i], out[j]] = [out[j], out[i]];
  }

  for (let len = 2; len <= n; len <<= 1) {
    const angle = (inverse ? 2 : -2) * Math.PI / len;
    const wl = {re: Math.cos(angle), im: Math.sin(angle)};
    for (let i = 0; i < n; i += len) {
      let w = {re: 1, im: 0};
      const half = len >> 1;
      for (let j = 0; j < half; j++) {
        const u = out[i + j];
        const x = out[i + j + half];
        const v = {
          re: x.re * w.re - x.im * w.im,
          im: x.re * w.im + x.im * w.re,
        };
        out[i + j] = {re: u.re + v.re, im: u.im + v.im};
        out[i + j + half] = {re: u.re - v.re, im: u.im - v.im};
        w = {
          re: w.re * wl.re - w.im * wl.im,
          im: w.re * wl.im + w.im * wl.re,
        };
      }
    }
  }

  if (inverse) {
    for (const x of out) {
      x.re /= n;
      x.im /= n;
    }
  }
  return out;
}

/** Exact TypeScript analogue of the supplied NumPy CCRB-8 equation. */
export function bind8CanonicalRoles(roleVectors: number[][]): number[] {
  if (roleVectors.length !== 8) {
    throw new Error(`CCRB-8 requires exactly 8 role vectors; got ${roleVectors.length}.`);
  }
  for (const v of roleVectors) {
    if (v.length !== KAILOS_DIMENSION) {
      throw new Error(
        `CCRB-8 requires ${KAILOS_DIMENSION}-dimensional vectors; got ${v.length}.`,
      );
    }
  }

  const product: Complex[] = Array.from(
    {length: KAILOS_DIMENSION},
    () => ({re: 1, im: 0}),
  );

  for (const vector of roleVectors) {
    const transformed = fft(vector.map((re) => ({re, im: 0})));
    for (let i = 0; i < KAILOS_DIMENSION; i++) {
      const a = product[i];
      const b = transformed[i];
      product[i] = {
        re: a.re * b.re - a.im * b.im,
        im: a.re * b.im + a.im * b.re,
      };
    }
  }

  const bound = fft(product, true).map((x) => x.re);
  return normalizeL2(bound);
}

/**
 * Experimental deterministic bridge from the user's prompt into eight
 * 4096-D vectors. It is intentionally labelled non-semantic: this lets us
 * isolate the effect of the binding mechanism without claiming that a hash
 * function is an embedding model.
 */
export function textToRoleVector(text: string, role: KailosRole): number[] {
  const vector = new Array<number>(KAILOS_DIMENSION).fill(0);
  const seed = `${role}\u0000${text}`;
  for (let i = 0; i < seed.length; i++) {
    const code = seed.charCodeAt(i);
    const mixed = (Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(code + 1, 0x85ebca6b)) >>> 0;
    const index = mixed % KAILOS_DIMENSION;
    vector[index] += ((mixed & 1) === 0 ? 1 : -1) * ((code % 31) + 1);
  }
  return normalizeL2(vector);
}

export function buildRoleVectors(text: string): number[][] {
  return KAILOS_ROLES.map((role) => textToRoleVector(text, role));
}

export function buildCcrb8SystemContext(userText: string): string {
  const z = bind8CanonicalRoles(buildRoleVectors(userText));
  const rounded = z.map((x) => Number(x.toPrecision(7)));
  const norm = Math.sqrt(z.reduce((sum, x) => sum + x * x, 0));

  return [
    '[KAILOS-CCRB8-BEGIN]',
    'Experimental Kailos semantic binding representation.',
    `Roles: ${KAILOS_ROLES.join(', ')}`,
    `Dimension: ${KAILOS_DIMENSION}`,
    'Binding: normalize(Re(IFFT(product FFT(E_i))))',
    `L2 norm: ${norm.toFixed(12)}`,
    `z_t: ${JSON.stringify(rounded)}`,
    '[KAILOS-CCRB8-END]',
  ].join('\n');
}

export function ccrb8Enabled(): boolean {
  return process.env.KAILOS_CCRB8_ENABLED === '1';
}
