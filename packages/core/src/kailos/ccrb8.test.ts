import {describe, expect, it} from 'vitest';
import {
  KAILOS_DIMENSION,
  KAILOS_ROLES,
  bind8CanonicalRoles,
  buildCcrb8SystemContext,
  buildRoleVectors,
  textToRoleVector,
} from './ccrb8.js';

function seededVector(seed: number): number[] {
  const values = new Array<number>(KAILOS_DIMENSION);
  let x = seed >>> 0;
  for (let i = 0; i < KAILOS_DIMENSION; i++) {
    x = (Math.imul(x ^ (x >>> 16), 0x45d9f3b) + i) >>> 0;
    values[i] = ((x / 0xffffffff) * 2) - 1;
  }
  return values;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / Math.sqrt(na * nb);
}

describe('Kailos CCRB-8', () => {
  it('binds exactly eight 4096-D vectors and conserves L2 norm', () => {
    const roles = Array.from({length: 8}, (_, i) => seededVector(i + 1));
    const z = bind8CanonicalRoles(roles);

    expect(z).toHaveLength(4096);
    const norm = Math.sqrt(z.reduce((sum, x) => sum + x * x, 0));
    expect(norm).toBeCloseTo(1, 10);
  });

  it('is permutation invariant, exposing the expected commutativity property', () => {
    const roles = Array.from({length: 8}, (_, i) => seededVector(i + 11));
    const reversed = [...roles].reverse();
    const a = bind8CanonicalRoles(roles);
    const b = bind8CanonicalRoles(reversed);

    expect(cosine(a, b)).toBeCloseTo(1, 10);
  });

  it('changes when a role vector is replaced', () => {
    const roles = Array.from({length: 8}, (_, i) => seededVector(i + 21));
    const baseline = bind8CanonicalRoles(roles);
    const altered = roles.map((v) => [...v]);
    altered[3] = seededVector(999);
    const changed = bind8CanonicalRoles(altered);

    expect(cosine(baseline, changed)).toBeLessThan(0.999999);
  });

  it('rejects incorrect role count and dimensionality', () => {
    expect(() => bind8CanonicalRoles(Array.from({length: 7}, () => seededVector(1))))
      .toThrow(/exactly 8/);
    expect(() => bind8CanonicalRoles([
      ...Array.from({length: 7}, () => seededVector(1)),
      new Array(128).fill(0),
    ])).toThrow(/4096-dimensional/);
  });

  it('creates distinct role vectors for the eight role labels', () => {
    const vectors = buildRoleVectors('Test Gemini representation interaction.');
    expect(vectors).toHaveLength(8);
    const pairwise = new Set<string>();
    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        pairwise.add(cosine(vectors[i], vectors[j]).toFixed(8));
      }
    }
    expect(pairwise.size).toBeGreaterThan(1);
  });

  it('produces a model-facing CCRB-8 system context with the expected metadata', () => {
    const context = buildCcrb8SystemContext('Explain why two memories conflict.');
    expect(context).toContain('[KAILOS-CCRB8-BEGIN]');
    expect(context).toContain('[KAILOS-CCRB8-END]');
    expect(context).toContain('Dimension: 4096');
    expect(context).toContain('Concept, Context, Time, Source, State, Action, Outcome, Valence');
    expect(context).toContain('L2 norm: 1.000000000000');
  });

  it('supports role-specific deterministic vectors for interaction experiments', () => {
    const vectors = KAILOS_ROLES.map((role) => textToRoleVector('same task', role));
    const changed = KAILOS_ROLES.map((role) => textToRoleVector('different task', role));
    expect(cosine(vectors[0], changed[0])).toBeLessThan(0.999999);
  });
});
