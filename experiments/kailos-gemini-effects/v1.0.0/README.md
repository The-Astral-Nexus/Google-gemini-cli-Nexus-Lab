# CCRB-8 × Gemini — v1.0.0

This experiment places the Kailos **Canonical 8-Role Circular Convolution Binding** in the Gemini CLI codebase and measures its observable effect on a Google Gemini model.

## Canonical operation

For eight 4096-dimensional role vectors:

`z_t = normalize(Re(IFFT(product_i FFT(E_i))))`

Roles:

1. Concept
2. Context
3. Time
4. Source
5. State
6. Action
7. Outcome
8. Valence

The implementation is in:

`packages/core/src/kailos/ccrb8.ts`

## What "part of the AI" means here

The CCRB-8 implementation is now an in-process component of the Gemini CLI runtime and has a controlled request-augmentation adapter in `kailosExperiment.ts`.

It is **not** a modification of Google's proprietary Gemini transformer weights. The observable intervention is made at the Gemini request/context layer. Any claim stronger than that requires access to a model architecture/checkpoint where the tensor operation can actually be inserted.

## Tests

`packages/core/src/kailos/ccrb8.test.ts` checks:

- exactly eight roles;
- 4096-D invariance;
- L2 unit-norm conservation;
- permutation invariance;
- sensitivity to replacing a role;
- dimensionality validation;
- role-specific vector generation;
- construction of the model-facing representation.

## Live Gemini test

`run-ccrb8-gemini.ts` performs three controlled calls:

### A — Baseline

The task is sent to Gemini without CCRB-8 context.

### B — CCRB-8 treatment

The identical task is sent with the computed `z_t` representation added to the system context.

### C — Decoder probe

Gemini receives the representation and is explicitly asked whether the vector itself has a trustworthy semantic decoder.

Results are written to `results/*.json`.

## Run

From the repository root, after installing the repository dependencies:

```bash
export GEMINI_API_KEY='...'
export GEMINI_MODEL='the-Gemini-model-you-want-to-test'

npx tsx experiments/kailos-gemini-effects/v1.0.0/run-ccrb8-gemini.ts
```

Optional:

```bash
export KAILOS_TEST_PROMPT='your controlled benchmark task'
```

## Interpretation rules

A change in Gemini's answer is **not automatically evidence that CCRB-8 improved reasoning**.

For a causal result we need repeated trials and controls, including:

- baseline vs treatment;
- identical task text;
- randomized task order;
- multiple independent tasks;
- repeated trials;
- token/latency measurements;
- permutation control;
- role-removal ablation;
- random-vector control;
- concatenation control;
- blinded scoring.

The first live experiment is therefore a **behavioral intervention test**, not a consciousness or internal-state test.
