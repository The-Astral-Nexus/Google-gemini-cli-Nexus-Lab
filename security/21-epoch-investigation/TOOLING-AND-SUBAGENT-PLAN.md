# Security Tooling and Subagent Plan

## Highest-value missing capabilities
1. GitHub control-plane administrator: Actions permissions, secrets metadata, environments, branch protection, rulesets, webhooks, deploy keys, collaborator permissions, installed Apps, audit log, workflow runs/artifacts/caches.
2. Workflow data-flow analyzer: trigger -> trust boundary -> checkout ref -> inputs -> secrets -> permissions -> shell/actions -> artifacts -> release/deploy side effects.
3. AI trust scanner: parse .gemini, GEMINI.md, skills, commands, policies, MCP and extension configuration; flag permission changes, shell/file access, credential access, ref manipulation and review suppression.
4. Supply-chain verifier: map every action SHA to repository/tag/release, verify immutable provenance, correlate advisories, inspect lockfiles/registry resolution and produce an SBOM.
5. Evidence system: append-only ledger with SHA-256 hashes of observations/reports, actor, timestamp, surface, source ref and authorization state.
6. Safe dynamic-analysis sandbox: disposable runner with no production credentials, restricted network, read-only source snapshot, process/network telemetry and automatic evidence capture.

## Recommended topology
Coordinator -> seven read-only specialists -> Evidence Custodian -> human-authorized remediation lane.

Specialists should operate independently so a compromised or incorrect analysis agent cannot silently validate another agent's conclusion. The coordinator reconciles disagreements rather than averaging them away.

## Required subagent contract
- read-only by default
- stable finding IDs and exact provenance
- OBSERVED / INFERRED / NEEDS-VERIFICATION status
- never print secret values
- never modify the repository
- never approve its own remediation
- provide reproducible queries and paths

## Why this materially improves security
The repository is itself an AI-agent codebase. A single general-purpose agent simultaneously inspecting and modifying it creates a common-mode failure: repository instructions can influence both analysis and remediation. Separating evidence collection, independent specialist analysis, evidence custody and remediation reduces that coupling.

## Dynamic execution gate
Dynamic execution remains forbidden until static review identifies the exact target, credentials are absent, network access is controlled, and a disposable runner has immutable telemetry. The current audit performed no repository-code execution.