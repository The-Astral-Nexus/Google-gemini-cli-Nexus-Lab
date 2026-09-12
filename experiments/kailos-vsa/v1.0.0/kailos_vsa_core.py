"""Kailos VSA core mathematical primitives v1.0.0."""
from __future__ import annotations
from typing import Dict, List, Optional, Tuple
import numpy as np

DIMENSION = 4096
CANONICAL_ROLES = ("Concept", "Context", "Time", "Source", "State", "Action", "Outcome", "Valence")
EPISTEMIC_MULTIPLIERS = {"VERIFIED": 1.00, "SUPPORTED": 0.90, "PROVISIONAL": 0.75, "UNCERTAIN": 0.50, "CONTRADICTED": 0.25, "SUPERSEDED": 0.25}
CONTRADICTION_PENALTIES = {"active": 0.0, "verified": 0.0, "supported": 0.0, "contradicted": 1.00, "superseded": 0.50, "uncertain": 0.25}
DEFAULT_RESONANCE_WEIGHTS = {"semantic": 0.20, "context": 0.15, "temporal": 0.15, "association": 0.10, "causal": 0.10, "reinforcement": 0.15, "novelty": 0.15, "contradiction": 0.40}

def normalize_l2(vector: np.ndarray) -> np.ndarray:
    v = np.asarray(vector, dtype=np.float64)
    if v.ndim != 1 or not np.all(np.isfinite(v)):
        raise ValueError("vector must be a finite 1-D array")
    norm = float(np.linalg.norm(v))
    if norm == 0.0:
        raise ValueError("cannot normalize a zero vector")
    return v / norm

def _validate_dimension(vector: np.ndarray, dimension: int = DIMENSION) -> None:
    if np.asarray(vector).shape != (dimension,):
        raise ValueError(f"expected vector shape ({dimension},), got {np.asarray(vector).shape}")

def bind_8_canonical_roles(role_vectors: List[np.ndarray]) -> np.ndarray:
    """CCRB-8: z_t = normalize(Re(IFFT(product_i FFT(E_i))))."""
    if len(role_vectors) != 8:
        raise ValueError(f"CCRB-8 requires exactly 8 role vectors, got {len(role_vectors)}")
    vectors = [np.asarray(v, dtype=np.float64) for v in role_vectors]
    for v in vectors:
        _validate_dimension(v)
    fft_prod = np.ones(DIMENSION, dtype=np.complex128)
    for v in vectors:
        fft_prod *= np.fft.fft(v)
    return normalize_l2(np.real(np.fft.ifft(fft_prod)))

def compute_beta_adaptive(base_beta: float = 0.05, novelty: float = 0.0, epistemic_status: str = "VERIFIED") -> float:
    """beta = clip(base_beta*(1+0.5*novelty)*mu, 0.005, 0.50)."""
    if not np.isfinite(base_beta) or not np.isfinite(novelty):
        raise ValueError("base_beta and novelty must be finite")
    mu = EPISTEMIC_MULTIPLIERS.get(epistemic_status.upper(), 0.50)
    return float(np.clip(base_beta * (1.0 + novelty * 0.5) * mu, 0.005, 0.50))

def update_continuous_state(M_prev: np.ndarray, z_t: np.ndarray, alpha: float = 0.995, beta_adaptive: float = 0.05) -> np.ndarray:
    """HAM-Omega: M_t = normalize(alpha*M_prev + beta_adaptive*z_t)."""
    _validate_dimension(M_prev)
    _validate_dimension(z_t)
    if not np.isfinite(alpha) or not np.isfinite(beta_adaptive):
        raise ValueError("alpha and beta_adaptive must be finite")
    return normalize_l2(alpha * np.asarray(M_prev, dtype=np.float64) + beta_adaptive * np.asarray(z_t, dtype=np.float64))

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(normalize_l2(a), normalize_l2(b)))

def _clip_score(value: float) -> float:
    if not np.isfinite(value):
        raise ValueError("resonance factor must be finite")
    return float(np.clip(value, 0.0, 1.0))

def compute_multi_factor_resonance(query_concept: np.ndarray, query_context: np.ndarray, mem_concept: np.ndarray, mem_context: np.ndarray, delta_t_seconds: float, decay_lambda: float = 1e-5, association_score: float = 0.0, causal_alignment: float = 0.0, memory_strength: float = 1.0, novelty_score: float = 0.0, epistemic_state: str = "active", weights: Optional[Dict[str, float]] = None) -> Tuple[float, Dict[str, float]]:
    """Weighted resonance with temporal decay and subtractive contradiction penalty."""
    for v in (query_concept, query_context, mem_concept, mem_context):
        _validate_dimension(v)
    if not np.isfinite(delta_t_seconds) or not np.isfinite(decay_lambda) or decay_lambda < 0:
        raise ValueError("invalid temporal parameters")
    w = dict(DEFAULT_RESONANCE_WEIGHTS)
    if weights:
        unknown = set(weights) - set(w)
        if unknown:
            raise ValueError(f"unknown resonance weight(s): {sorted(unknown)}")
        w.update(weights)
    semantic = _clip_score(cosine_similarity(query_concept, mem_concept))
    context = _clip_score(cosine_similarity(query_context, mem_context))
    temporal = float(np.exp(-decay_lambda * max(delta_t_seconds, 0.0)))
    association = _clip_score(association_score)
    causal = _clip_score(causal_alignment)
    reinforcement = _clip_score(memory_strength)
    novelty = _clip_score(novelty_score)
    state = epistemic_state.lower()
    if state not in CONTRADICTION_PENALTIES:
        raise ValueError(f"unknown epistemic_state: {epistemic_state!r}")
    contradiction = CONTRADICTION_PENALTIES[state]
    positive = (w["semantic"]*semantic + w["context"]*context + w["temporal"]*temporal + w["association"]*association + w["causal"]*causal + w["reinforcement"]*reinforcement + w["novelty"]*novelty)
    penalty = w["contradiction"] * contradiction
    resonance = float(positive - penalty)
    return resonance, {"semantic": semantic, "context": context, "temporal": temporal, "association": association, "causal": causal, "reinforcement": reinforcement, "novelty": novelty, "contradiction": contradiction, "contradiction_penalty": penalty, "positive_score": positive, "resonance": resonance}
