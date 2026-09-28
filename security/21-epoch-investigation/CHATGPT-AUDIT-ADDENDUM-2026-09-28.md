# Independent Audit Addendum — 2026-09-28

## Provenance boundary

This addendum records observations made by the ChatGPT GitHub audit session after the quarantine branch was created. It is intentionally separate from the existing 21-epoch ledger because the branch acquired additional commits from another actor/process during the investigation. Those commits are preserved as evidence and are not attributed to this session.

### Baseline
- Repository: The-Astral-Nexus/Google-gemini-cli-Nexus-Lab
- Main tree SHA observed: 6b3936ea767bd8b3b72fd9b50b4c8c1fc4d870b5
- Main was not modified by this audit session.
- Quarantine branch: quarantine/pre-lockdown-2026-09-28
- Rulesets endpoint returned an empty list.
- Quarantine branch protection is explicitly disabled.

## Material external-change observation

After this session's initial quarantine commit, the quarantine branch advanced through commits not created by this session:
- b0963748b1f6aabfb09d6083c95ef6f084a622ed — security: append investigation epochs 9-18 to ledger
- 7bbf08e567954ede299ee0306889d55cd42b4a9d — security: update 21-epoch SOP investigation status

Both identify ProjectLaunchPadLLC as author and committer. The latter is unsigned/unverified. A comparison shows 7bbf08e adds 9 lines to security/21-epoch-investigation/SOP.md; the earlier chain added FINDINGS.md, LEDGER.md and SOP.md. These are observed repository changes, not actions claimed by this audit session.

This establishes a critical provenance requirement: the quarantine branch itself must be monitored for concurrent writers before accepting security conclusions or remediation commits.

## 21-epoch findings

1. Repository identity: public, unarchived, fork; current connector actor reports admin/maintain/push/pull/triage.
2. Governance: rulesets empty; main branch protection query returned 403 and is therefore unverified; Allstar branch-protection file only logs.
3. Provenance: CCRB/Kailos user commits are unverified/unsigned; adjacent upstream release/security commits are verified. This is a provenance weakness, not evidence of malicious authorship.
4. Workflow inventory: 49 workflow files observed. High-impact triggers include scheduled, manual, issue/comment, pull_request_target and workflow_run.
5. Permissions: observed credential classes include Gemini API keys, GitHub tokens/robot PATs, GitHub App private keys, npm/Wombat tokens, Docker credentials and release/signing credentials.
6. AI trust: .gemini/settings.json enables experimental extension reloading, model steering, auto-memory, voice mode, devtools and noninteractive agent sessions. Multiple Gemini workflows set GEMINI_CLI_TRUST_WORKSPACE=true.
7. Action supply chain: many actions are SHA-pinned, but some workflows use mutable @v4 references. Provenance should be verified, not inferred from pinning alone.
8. Executable surface: recursive tree census observed 24 executable-mode blobs. Executable bits are execution surfaces, not evidence of malware.
9. Package execution: package lifecycle includes prepare invoking husky and npm run bundle; npm installation is therefore an execution event.
10. Credential flow: scripts/send_gemini_request.sh sources .env and transmits GEMINI_API_KEY in a URL query parameter.
11. Release authority: release automation has package publication and GitHub release authority; token-bearing release paths require isolation and rotation review.
12. Event attack surface: AI issue/PR automation consumes issue/comment content; pull_request_target plus privileged secrets requires dedicated review.
13. Artifacts: several workflows upload test/evaluation artifacts; cross-run provenance and redaction are not yet independently reconciled.
14. Cloud execution: .gcp contains Cloud Build/Docker execution definitions, so GitHub Actions quarantine alone is not a complete execution-plane quarantine.
15. Skills/MCP/extensions: repository-controlled skills, commands, MCP and extension implementation form a separate trust boundary.
16. Experimental/Kailos: CCRB workflows install dependencies and execute TypeScript with Gemini credentials; disabled on quarantine branch, not main.
17. Telemetry: scripts can spawn collectors and export telemetry to Google Cloud; outbound data flow requires review.
18. Historical execution: substantial Actions activity is reported; complete logs/artifacts reconciliation remains open.
19. Advisory: GHSA-wpqr-6v78-jr5g was independently checked. The observed run-gemini-cli SHA maps to patched 0.1.22 rather than a pre-0.1.22 release. Full SBOM correlation remains open.
20. Remediation architecture: read-only analysis should be separated from narrowly authorized remediation.
21. Reconciliation gate: execution remains on security hold until controls, credentials, release authority, historical runs/artifacts, dependency state and concurrent-writer provenance are reconciled.

## Priority findings

- SEC-A01 Critical: main repository execution is not proven disabled. Only three workflow files were disabled on the quarantine branch; repository-level Actions state is not available through the current integration.
- SEC-A02 Critical: release/deployment authority exists beyond ordinary CI, including package publication and cloud/Docker execution.
- SEC-A03 Critical: concurrent modification of the quarantine branch occurred during the audit; writer identity and authorization must be reconciled.
- SEC-A04 High: pull_request_target plus privileged secrets plus build/install execution requires dedicated review.
- SEC-A05 High: AI workflows load repository-controlled .gemini configuration/skills while trusted workspace is enabled.
- SEC-A06 High: 49 workflows create multiple independent execution paths.
- SEC-A07 High: release/publishing credentials need isolation and rotation review.
- SEC-A08 High: 24 executable-mode blobs require classification and authorization mapping.
- SEC-A09 Medium: .npmrc uses the Wombat registry. External research confirms multiple Google projects use it for publication, so its presence alone is not evidence of compromise; registry provenance and package-resolution policy still require verification.
- SEC-A10 Medium: send_gemini_request.sh exposes API keys through URL query parameters and sources .env automatically.
- SEC-A11 Medium: 56 MB memory-tests/large-chat-session.json is a significant data-disclosure surface requiring content/secret review.
- SEC-A12 Medium: quarantine branch is explicitly unprotected.

## Verification gaps
1. Repository/org Actions enabled state.
2. Main branch protection/rulesets.
3. Secrets metadata, environments and deployment protection.
4. Webhooks, deploy keys, GitHub Apps and collaborators.
5. Historical run logs and artifacts.
6. Complete workflow trigger/permission/secret data-flow matrix.
7. Complete local composite-action inventory.
8. Lockfile/SBOM/advisory correlation.
9. Large test-data content review.
10. Authorization of concurrent quarantine-branch writers.

## Recommended subagents
1. Workflow Sentinel — static workflow AST/data-flow analysis; read-only.
2. AI Trust-Boundary Auditor — .gemini, skills, prompts, MCP, extensions and tool policies.
3. Credential/Identity Auditor — secret names, token scopes, OIDC/App identities; never reads secret values.
4. Supply-Chain Auditor — action SHAs, npm registry, lockfiles, SBOM, advisories, vendored binaries.
5. Release Authority Auditor — publish/tag/release/Docker/GCP paths.
6. Artifact and Telemetry Forensics Auditor — historical runs, logs, artifacts, caches and outbound data.
7. Dynamic Sandbox Analyst — only after explicit authorization and isolated from real credentials/network.
8. Evidence Custodian — hashes and reconciles every report and provenance claim.

No analysis subagent should possess write access. A separate human-authorized remediation lane should be the only write-capable path.