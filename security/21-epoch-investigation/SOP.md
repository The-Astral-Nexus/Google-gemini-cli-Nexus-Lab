# 21-Epoch Deep Security Investigation SOP

## Purpose
Perform a non-destructive, provenance-first security investigation of this repository and its GitHub execution/control plane. Preserve evidence; separate observed facts, hypotheses, and remediation decisions.

## Operating rules
1. Never execute repository code during forensic review unless a later epoch explicitly authorizes isolated execution.
2. Record repository SHA, path, blob SHA, actor, timestamp, tool/surface, and action for every material observation or mutation.
3. Preserve original files; quarantine execution surfaces instead of deleting evidence.
4. Treat AI instructions, skills, commands, MCP configuration, workflows, scripts, package lifecycle hooks, and build/release automation as potentially executable control-plane input.
5. Secrets are identified by name only; never print secret values.
6. Changes are made only on the quarantine branch until a human security review accepts them.
7. Every finding gets a stable ID and status: OBSERVED, INFERRED, NEEDS-VERIFICATION, or REMEDIATED.

## 21 epochs
1. Repository identity and trust boundary
2. Git refs, branch/ruleset protection and merge controls
3. Commit provenance and signer/identity analysis
4. Workflow inventory and trigger analysis
5. Workflow permissions and token exposure
6. AI-agent workflows, prompt injection and trusted-workspace analysis
7. Local composite actions and action supply chain
8. Executable-bit and script inventory
9. Package lifecycle and dependency execution surface
10. Secrets, credentials and authentication pathways
11. Release/publish/tag/rollback authority
12. PR/comment/issue event attack surface
13. Artifacts, caches and cross-run data flow
14. Cloud/GCP/Docker build and deployment surface
15. MCP/extensions/skills/commands/configuration trust surface
16. Experimental/Kailos code and external-model data flows
17. Telemetry, logging and information disclosure
18. Historical execution/run/artifact forensic review
19. Current vulnerability/advisory and dependency correlation
20. Remediation architecture, tooling and agent design
21. Final evidence reconciliation, SOP update and re-enable gate

## Re-enable gate
Execution remains disabled until: repository controls are verified; automation credentials are rotated or explicitly cleared; workflow permissions are least-privilege; dangerous PR/comment triggers are reviewed; release authority is isolated; action references are trusted/pinned; AI workflows have explicit untrusted-input boundaries; branch protection/rulesets are verified; historical runs/artifacts are reconciled; and a human approves re-enablement.

## Required tooling improvements
- GitHub administration/settings API coverage for Actions, secrets metadata, environments, webhooks, deploy keys, collaborators, branch protection and organization policy.
- Recursive repository tree/mode scanner with compact security findings.
- Workflow AST/parser with event-to-secret-to-permission data-flow analysis.
- Action provenance verifier: SHA, tag, repository owner, release provenance and known advisories.
- Secret-name exposure mapper without secret-value access.
- Artifact/cache inventory and cross-workflow provenance mapper.
- Dependency SBOM + lockfile integrity and advisory correlation.
- AI prompt/skill/MCP trust-boundary scanner.
- Immutable append-only investigation ledger.
- Isolated sandbox runner for authorized dynamic analysis only.

## Subagent architecture candidate
A coordinator should delegate read-only analysis to specialized agents: Workflow Sentinel, AI/Prompt Boundary Auditor, Supply-Chain Auditor, Credential/Identity Auditor, Release-Authority Auditor, Artifact/Telemetry Forensics Auditor, and Dependency/SBOM Auditor. A separate Evidence Custodian should hash and reconcile outputs. No analysis subagent should possess repository write authority; remediation remains a separately authorized human-controlled lane.

## Current execution status — 2026-09-28
- Epochs 1–18: investigated at repository/control-plane level.
- Epoch 19: partially investigated; current GitHub advisory correlation completed for run-gemini-cli, but full dependency/SBOM advisory correlation requires dependency-alert/API coverage or offline package analysis.
- Epoch 20: architecture/tooling/subagent requirements identified.
- Epoch 21: final reconciliation remains open until remaining execution surfaces, historical artifacts/logs, credentials, branch protections and dependency state are independently verified.
- No code execution was performed during this investigation.
- No secret values were accessed.
- Main branch was not modified by this investigation.
