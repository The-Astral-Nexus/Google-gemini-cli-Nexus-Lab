# Kailos VSA Core v1.0.0

Experimental numerical implementation of three Kailos memory primitives for the Gemini CLI Nexus Lab:

1. **CCRB-8** — canonical 8-role circular-convolution binding.
2. **HAM-Omega** — adaptive continuous state update.
3. **Multi-factor resonance** — semantic/context similarity, temporal decay, association, causal alignment, reinforcement, novelty, and explicit contradiction penalties.

## Mathematical core

CCRB-8:

`z_t = normalize_2(Re(IFFT(product_i FFT(E_i))))`

HAM-Omega:

`M_t = normalize_2(alpha M_(t-1) + beta_adaptive z_t)`

Adaptive velocity:

`beta_adaptive = clip(base_beta * (1 + 0.5 novelty) * mu, 0.005, 0.50)`

Resonance:

`R = w_sem S_sem + w_ctx S_ctx + w_temp W_temp + w_assoc A + w_causal C + w_reinf R + w_nov N - w_contra P_contra`

with `W_temp = exp(-lambda * max(delta_t, 0))`.

## Verification

The test suite verifies:

- 4096-dimensional output/state invariance.
- L2 unit-norm conservation after binding and state update.
- CCRB-8 permutation invariance.
- adaptive-beta bounds and epistemic scaling.
- explicit contradiction penalty: default contradicted state subtracts `0.40` from resonance.
- monotonic temporal decay.

Run locally with Python 3 and NumPy:

```bash
python -m pip install numpy pytest
cd experiments/kailos-vsa/v1.0.0
pytest -q
python kailos_vsa_core.py
```

## Scientific status

This is a **research implementation**, not evidence that these mechanisms are part of Gemini's internal model. The CCRB-8 operation is mathematically permutation invariant because frequency-domain multiplication is commutative; therefore the current primitive does not preserve role identity by itself. Any claim that the representation improves Gemini performance requires controlled A/B experiments against suitable baselines.
