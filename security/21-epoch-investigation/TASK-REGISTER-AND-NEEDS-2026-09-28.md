# Security Sweep Task Register — 2026-09-28

Status vocabulary: OBSERVED = directly verified; OPEN = required but not yet completed; BLOCKED = capability unavailable; DO NOT EXECUTE = static-only gate.

## OBSERVED baseline
- main: 6b3936ea767bd8b3b72fd9b50b4c8c1fc4d870b5
- main protection: disabled/false
- rulesets endpoint: []
- total-disable branch: 1142cdc840bcdc78298a2dd822b6cde774182733
- total-disable branch tree contains only TOTAL-QUARANTINE.md
- main inventory: 49 workflows; 24 executable-mode blobs; 71 .gemini paths; 5 .gcp paths; 6 Docker-related files; 56,434,129-byte large chat-session JSON.
- main is still publicly visible and unarchived.

## MUST — immediate containment
1. Freeze main writes. Method: organization/repository administrative control; temporarily remove write rights except one named custodian.
2. Disable GitHub Actions at repository/org level. Method: GitHub Settings -> Actions -> General -> disable actions, or equivalent org policy.
3. Cancel all running workflows. Method: Actions control plane/API; record every cancelled run.
4. Disable schedules/dispatch/repository_dispatch/release automation. Method: Actions control plane; verify no queued runs remain.
5. Disable deployments/environments. Method: repository environments and deployment protection settings.
6. Revoke/rotate every automation secret. Minimum observed classes: Gemini API, robot PAT, GitHub App private key, npm/Wombat tokens, Docker credentials, GCP/service credentials. Never print values.
7. Disable/revoke webhooks and deploy keys unless individually authorized.
8. Restrict collaborators/GitHub Apps to an explicit allowlist.
9. Make repository private or archive it if the objective is total external isolation. Record exact before/after state.
10. Protect main with required review, signed commits where feasible, linear/non-force updates, and no direct pushes.
11. Preserve immutable forensic snapshots before destructive cleanup.

## MUST — execution-plane quarantine
12. Quarantine all 49 workflow definitions; preserve content as evidence but move them out of active .github/workflows or disable Actions globally first.
13. Quarantine all 24 executable-mode blobs; preserve hashes/content in evidence storage.
14. Quarantine .gemini skills, commands, settings, MCP/extension configuration.
15. Quarantine .husky/pre-commit and all hooks.
16. Quarantine .gcp and Docker build/deploy definitions.
17. Quarantine release/publishing workflows and local composite actions.
18. Disable package lifecycle execution during analysis; do not run npm ci/install/preflight.
19. Do not execute repository scripts, binaries, tests, builds, extensions, MCP servers, or Gemini agents during static investigation.
20. Treat memory-tests/large-chat-session.json as sensitive evidence; inspect only with non-executing secret/PII scanning.

## MUST — workflow review
21. Produce a 49-row workflow matrix: trigger, actor, checkout ref, permissions, secrets, inputs, AI/tool use, external network, artifacts, release/deploy side effects.
22. Review all issue/comment-triggered AI workflows for untrusted-input injection.
23. Review workflows with id-token:write.
24. Review all release workflows for package/Git/tag authority.
25. Review local actions under .github/actions.
26. Verify every third-party action SHA against upstream release/tag provenance.
27. Replace mutable @v4-style action references with verified immutable SHAs before re-enable.
28. Remove contents:write unless individually justified.
29. Remove pull-requests/issues write unless individually justified.
30. Require explicit environment approvals for release/deploy jobs.

## MUST — credential and identity audit
31. Inventory secret NAMES only; never retrieve secret values.
32. Map each secret to workflow/environment/job.
33. Determine actual scopes of robot PAT/App identities.
34. Rotate all credentials that entered a repository-controlled AI workflow before quarantine.
35. Audit OIDC trust policies and cloud service-account bindings.
36. Audit npm/Wombat publishing authorization.
37. Audit Docker registry authorization.
38. Audit GitHub App installations and permissions.
39. Audit deploy keys and SSH signing/authentication keys.
40. Audit collaborator and team permissions.

## MUST — AI-agent security
41. Inventory every agent, skill, command, extension, MCP server and policy.
42. Classify each as read-only / filesystem-write / network / GitHub-write / credential-capable.
43. Remove write credentials from analysis agents.
44. Create an isolated read-only security-analysis environment.
45. Establish separate human-authorized remediation lane.
46. Add prompt-injection tests for issue, PR, comment, docs and repository-controlled instructions.
47. Verify trusted-workspace behavior before any Gemini workflow is re-enabled.
48. Audit agent memory persistence and artifact retention.
49. Audit model/tool permission escalation paths.

## MUST — supply chain
50. Generate SBOM from a clean, offline/static dependency snapshot.
51. Audit package-lock and all workspace lockfiles.
52. Verify registry configuration and package provenance.
53. Audit lifecycle scripts.
54. Audit vendored binaries including ripgrep.
55. Correlate dependencies/actions against current advisories.
56. Review Docker base images and image provenance.
57. Review Cloud Build dependencies and service identities.

## MUST — historical forensics
58. Export workflow/run/job metadata for the full relevant retention window.
59. Export logs and artifact manifests.
60. Identify runs that received secrets.
61. Identify runs that used write permissions.
62. Identify runs that performed releases/deployments/pushes.
63. Search historical artifacts for accidental secret disclosure.
64. Reconcile branch/ref changes against actor identity and authorization.
65. Investigate concurrent quarantine-branch writers.
66. Preserve evidence before deleting historical artifacts.

## MUST — provenance
67. Maintain append-only ledger with timestamp, surface, actor, session/run, operation, SHA, purpose and authorization state.
68. Hash every evidence package.
69. Separate ChatGPT/Codex activity from repository/GitHub activity.
70. Record unavailable telemetry explicitly.
71. Require authentication/authorization/review at the top of every remediation record.
72. Never attribute an external commit/tool action to this audit without direct evidence.

## NEEDS — tooling
A. GitHub administrative control-plane access for Actions, secrets metadata, environments, branch protection/rulesets, webhooks, deploy keys, collaborators, Apps, audit log, runs, artifacts and caches.
B. Read-only GitHub audit-log export.
C. Workflow AST/data-flow analyzer.
D. AI trust-boundary scanner for .gemini/MCP/skills/extensions.
E. Secret-name/secret-flow scanner that never emits values.
F. SBOM/dependency/advisory scanner.
G. Action SHA provenance verifier.
H. Artifact/log forensic scanner.
I. Disposable dynamic-analysis sandbox with no production credentials.
J. Evidence hashing/append-only ledger service.
K. Network egress monitor for dynamic testing.
L. Container/image provenance scanner.

## RECOMMENDED SECURITY SUBAGENTS
1. Workflow Sentinel — read-only.
2. AI Trust-Boundary Auditor — read-only.
3. Credential/Identity Auditor — metadata only.
4. Supply-Chain Auditor — read-only.
5. Release Authority Auditor — read-only.
6. Artifact/Telemetry Forensics Auditor — read-only.
7. Dynamic Sandbox Analyst — isolated, last-stage only.
8. Evidence Custodian — append-only, no remediation authority.
9. Human-authorized Remediation Agent — sole write-capable automation, gated by review.

## RELEASE GATE
No execution, deployment, package publication, workflow re-enable, secret restoration, or merge to main until all MUST controls are closed or explicitly accepted by the human security owner with provenance recorded.
