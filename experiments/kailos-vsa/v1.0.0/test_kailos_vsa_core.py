"""Deterministic verification tests for Kailos VSA v1.0.0."""
import numpy as np

from kailos_vsa_core import (
    DIMENSION,
    CANONICAL_ROLES,
    bind_8_canonical_roles,
    compute_beta_adaptive,
    compute_multi_factor_resonance,
    normalize_l2,
    update_continuous_state,
)


def test_ccrb8_dimension_and_unit_norm():
    rng = np.random.default_rng(7)
    roles = [normalize_l2(rng.standard_normal(DIMENSION)) for _ in CANONICAL_ROLES]
    z = bind_8_canonical_roles(roles)
    assert z.shape == (4096,)
    assert np.isclose(np.linalg.norm(z), 1.0, atol=1e-12)


def test_ccrb8_permutation_invariance():
    rng = np.random.default_rng(8)
    roles = [normalize_l2(rng.standard_normal(DIMENSION)) for _ in CANONICAL_ROLES]
    a = bind_8_canonical_roles(roles)
    b = bind_8_canonical_roles(list(reversed(roles)))
    assert np.isclose(float(np.dot(a, b)), 1.0, atol=1e-10)


def test_ham_omega_preserves_dimension_and_norm():
    rng = np.random.default_rng(9)
    m = normalize_l2(rng.standard_normal(DIMENSION))
    z = normalize_l2(rng.standard_normal(DIMENSION))
    beta = compute_beta_adaptive(novelty=0.4, epistemic_status="VERIFIED")
    updated = update_continuous_state(m, z, alpha=0.995, beta_adaptive=beta)
    assert updated.shape == (4096,)
    assert np.isclose(np.linalg.norm(updated), 1.0, atol=1e-12)


def test_beta_bounds_and_epistemic_scaling():
    assert 0.005 <= compute_beta_adaptive() <= 0.50
    verified = compute_beta_adaptive(epistemic_status="VERIFIED")
    uncertain = compute_beta_adaptive(epistemic_status="UNCERTAIN")
    assert verified > uncertain


def test_contradiction_penalty_is_explicit_and_subtractive():
    rng = np.random.default_rng(10)
    q1 = normalize_l2(rng.standard_normal(DIMENSION))
    q2 = normalize_l2(rng.standard_normal(DIMENSION))
    kwargs = dict(
        query_concept=q1, query_context=q2, mem_concept=q1, mem_context=q2,
        delta_t_seconds=0.0, association_score=0.5, causal_alignment=0.5,
        memory_strength=1.0, novelty_score=0.5,
    )
    active, active_factors = compute_multi_factor_resonance(**kwargs, epistemic_state="active")
    contradicted, contradicted_factors = compute_multi_factor_resonance(**kwargs, epistemic_state="contradicted")
    assert contradicted < active
    assert np.isclose(active - contradicted, 0.40, atol=1e-12)
    assert np.isclose(contradicted_factors["contradiction_penalty"], 0.40, atol=1e-12)
    assert np.isclose(active_factors["contradiction_penalty"], 0.0, atol=1e-12)


def test_temporal_decay_is_monotonic():
    rng = np.random.default_rng(11)
    q1 = normalize_l2(rng.standard_normal(DIMENSION))
    q2 = normalize_l2(rng.standard_normal(DIMENSION))
    kwargs = dict(query_concept=q1, query_context=q2, mem_concept=q1, mem_context=q2)
    near, _ = compute_multi_factor_resonance(**kwargs, delta_t_seconds=0.0)
    far, _ = compute_multi_factor_resonance(**kwargs, delta_t_seconds=100000.0)
    assert far < near
