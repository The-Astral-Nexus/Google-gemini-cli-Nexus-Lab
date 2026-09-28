# Security Findings — 21-Epoch Investigation

## Critical / immediate containment

SEC-001 — Old run-gemini-cli revision. Multiple workflows pin google-github-actions/run-gemini-cli@a3bf79042542528e91937b3a3a6fbc4967ee3c31. GitHub advisory GHSA-wpqr-6v78-jr5g identifies affected versions below 0.1.22 and describes headless workspace-trust/tool-allowlisting RCE risk. The exact pinned SHA must be verified against the patched release before re-enable.
SEC-002 — Trusted-workspace AI execution. docs-audit.yml, multiple Gemini workflows, and .github/actions/run-tests/action.yml set GEMINI_CLI_TRUST_WORKSPACE=true. Repository-controlled .gemini skills/configuration therefore participate in the AI execution trust boundary.
SEC-003 — Automatic PR merge capability. .github/actions/create-pull-request/action.yml creates a PR and then runs gh pr merge "$PR_URL" --auto.
SEC-004 — Release pipeline authority. publish-release accepts npm/Wombat tokens, GitHub release tokens/PATs and Gemini credentials; it can push branches, publish packages, tag releases and create GitHub releases.
SEC-005 — High-value credentials are distributed across automation: Gemini API keys, GitHub tokens, App private keys, npm/Wombat tokens, Docker credentials and signing certificates.
SEC-006 — pull_request_target secret/build boundary. eval-pr.yml uses pull_request_target, accesses GITHUB_TOKEN and GEMINI_API_KEY, and runs npm ci/npm run build. Exact checkout and gating require dedicated review.

## High
SEC-007 — chained_e2e.yml combines workflow_run with permissions: write-all, GitHub tokens and Gemini credentials.
SEC-008 — 49 workflow files create a large execution/control plane: scheduled, manual, issue-comment, pull_request_target, workflow_run, repository_dispatch and release automation.
SEC-009 — Executable modes: 4 files under .gemini/skills, 9 under scripts/, 1 under .github/scripts/. This is an execution supply-chain surface, not evidence of malware.
SEC-010 — .gemini/settings.json enables experimental extensionReloading, modelSteering, autoMemory, voiceMode, devtools and noninteractive agent sessions.
SEC-011 — publish-release embeds a credential in an HTTPS git remote URL.
SEC-012 — verify-release performs external npm install/npx operations and then runs integration tests with Gemini credentials.
SEC-013 — push-docker sets provenance:false for published images.
SEC-014 — push-sandbox accepts a Docker Hub read/write PAT and publishes images.
SEC-015 — .gcp/development-worker.yml and release-docker.yml execute npm install/auth/build and Docker pushes outside GitHub Actions.

## Medium / needs verification
SEC-016 — Repository metadata: public and unarchived.
SEC-017 — Rulesets endpoint returned []; branch-protection endpoint returned 403 from the integration. Protection state is UNVERIFIED, not assumed absent.
SEC-018 — .allstar/branch_protection.yaml contains only action: log; this is not proof of enforced branch protection.
SEC-019 — scripts/send_gemini_request.sh sources .env into the environment and places GEMINI_API_KEY in a URL query parameter.
SEC-020 — setup-npmrc writes a GitHub token into ~/.npmrc.
SEC-021 — Multiple AI issue/PR workflows consume untrusted issue/comment content and pass it into Gemini.
SEC-022 — Actions API reports 724 historical workflow runs; sampled newest runs included startup_failure. This does not establish compromise.
SEC-023 — Latest 14 user-authored CCRB/Kailos commits are marked verification=false, unlike adjacent verified upstream commits.
SEC-024 — Action pinning is mixed: many full SHAs, but CCRB workflows use mutable @v4 references and some upstream-derived workflow comments reference mutable tags.
SEC-025 — Root package lifecycle includes prepare: husky && npm run bundle; dependency installation is itself an execution event and must not occur in an untrusted privileged workflow.

## Non-findings / distinctions
- No secret value was retrieved or displayed.
- No evidence of compromise was established.
- Executable source is not itself evidence of malware.
- Public/fork metadata is not evidence of unauthorized access.