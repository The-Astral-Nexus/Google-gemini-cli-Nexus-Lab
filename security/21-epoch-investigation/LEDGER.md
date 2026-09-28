# Investigation Ledger — 2026-09-28

Branch: `quarantine/pre-lockdown-2026-09-28`
Base main SHA at snapshot: `6b3936ea767bd8b3b72fd9b50b4c8c1fc4d870b5`

## Entry 001 — Snapshot and quarantine
- Surface: GitHub repository API
- Action: Created quarantine branch.
- Result: branch created successfully.
- Action: Added `QUARANTINE.md`.
- Commit: `4ee3480d50313fbc3931f35ac23a84c27fd5fb5c`
- Action: Disabled three previously identified workflow bodies on quarantine branch using unconditional false guards.
- Original workflow SHAs preserved in replacement files.

## Entry 002 — Repository control-plane inventory
- Observed repository is public, unarchived, and marked as a fork.
- Reported connector permissions for current actor: admin/maintain/push/pull/triage.
- Rulesets endpoint returned an empty list.
- Branch-protection endpoint returned HTTP 403 from the integration; branch protection is therefore UNVERIFIED, not assumed absent.
- `.allstar/branch_protection.yaml` contains only `action: 'log'`; this is not evidence of enforced GitHub branch protection.

## Entry 003 — Workflow inventory
- Observed 49 workflow files under `.github/workflows` on main.
- Three CCRB/docs workflows were previously quarantined on the investigation branch; the remaining workflows on main are still executable unless repository-level Actions controls say otherwise.
- High-risk classes observed: `pull_request_target`, `workflow_run`, `issue_comment`, scheduled AI workflows, release workflows, nested reusable workflows, local composite actions, and workflows with write-all/status write permissions.

## Entry 004 — AI configuration surface
- `.gemini/settings.json` enables experimental extension reloading, model steering, auto memory, voice mode, devtools, and noninteractive agent sessions.
- `.gemini/skills` contains 32 blobs; 4 have executable mode 100755.
- `.gemini/commands` contains 12 blobs.
- `GEMINI.md` is repository-controlled AI context and explicitly describes AI agent, MCP, shell, file and automation capabilities.

## Entry 005 — Executable surface
- `scripts/`: 83 blobs, 9 executable-mode files.
- `.github/scripts/`: 8 blobs, 1 executable-mode file.
- `.gemini/skills/`: 32 blobs, 4 executable-mode files.
- Example: `scripts/send_gemini_request.sh` loads `.env` into the environment and sends its `GEMINI_API_KEY` to the Google Generative Language API. This is a credential/data-flow surface, not proof of compromise.
- `.github/actions/run-tests/action.yml` sets `GEMINI_CLI_TRUST_WORKSPACE: true` and executes build/unit/integration tests with a supplied Gemini key.

## Entry 006 — Release authority
- `.github/actions/create-pull-request/action.yml` contains `gh pr merge "$PR_URL" --auto` after creating a PR. This is an observed automatic-merge capability and is a critical governance concern for a quarantine review.
- `.github/actions/publish-release/action.yml` accepts npm publish tokens and GitHub release tokens, can push a release branch using a token embedded in an HTTPS remote, publishes multiple packages, tags releases, and creates GitHub releases. This is a high-impact credentialed execution surface.

## Entry 007 — Workflow security observations
- `docs-audit.yml` requests `contents: write` and `pull-requests: write`, sets `GEMINI_CLI_TRUST_WORKSPACE: true`, supplies `GEMINI_API_KEY`, uploads artifacts, and supplies `GEMINI_CLI_ROBOT_GITHUB_PAT` to PR creation.
- Multiple workflows use Gemini API keys, GitHub tokens, App private keys, npm/Wombat tokens, Docker credentials, and signing certificates.
- `chained_e2e.yml` contains `permissions: write-all` in jobs and uses `workflow_run`, GitHub tokens and Gemini credentials.
- `eval-pr.yml` uses `pull_request_target` and accesses secrets while checking out/building code. This requires focused untrusted-PR provenance review.
- Multiple AI issue/PR workflows respond to `issue_comment` or scheduled events and can call Gemini with repository credentials.

## Entry 008 — Execution history
- Actions API reported 724 workflow runs at time of inspection.
- Latest sampled runs included repeated `startup_failure` conclusions. This proves failed starts, not absence of historical execution or compromise.
- Historical commit inspection shows user-authored CCRB-8 changes beginning 2026-09-12 and verified upstream Gemini CLI security hardening commits immediately before them.

## Status
Epochs 1–8: materially investigated.
Epochs 9–21: pending deeper file-by-file and historical dynamic evidence analysis.

## Immediate needs
1. Disable repository/org Actions at the settings plane, if administratively available.
2. Rotate/revoke all automation credentials named in workflows before re-enablement.
3. Verify branch protection/rulesets outside the current integration boundary.
4. Inventory all 49 workflows and local actions for exact permissions, triggers, secret flow, and command injection.
5. Inspect historical run jobs/logs/artifacts for credential exposure and unexpected actors.

## Entry 009 — Action advisory correlation
- External GitHub advisory review confirmed GHSA-wpqr-6v78-jr5g affects run-gemini-cli versions below 0.1.22 and documents headless workspace trust/tool allowlisting RCE risk. The repository's pinned SHA must be independently mapped to a patched release before re-enable.
- Source: GitHub Advisory Database. No claim of exploitation was made.

## Entry 010 — Release authority inspection
- Inspected local composite actions.
- Observed create-pull-request performs automatic merge via `gh pr merge --auto`.
- Observed publish-release can push branches, publish packages, tag releases and create GitHub releases using supplied credentials.
- Observed setup-npmrc writes a GitHub token to ~/.npmrc.
- Observed verify-release installs from npm/npx and executes integration tests with Gemini credentials.
- Observed push-docker disables provenance metadata and push-sandbox accepts Docker Hub R/W credentials.

## Entry 011 — Cloud execution-plane inspection
- Observed .gcp Cloud Build definitions independently execute dependency installation, authentication, builds and Docker pushes.
- Therefore GitHub Actions quarantine is not a complete repository execution-plane quarantine.

## Entry 012 — AI trust-surface inspection
- .gemini contains commands, skills and settings.
- 32 skill blobs were counted; 4 executable-mode files.
- Experimental settings include extension reloading, model steering, auto memory, voice mode, devtools and noninteractive agent sessions.
- GEMINI.md is repository-controlled agent context and documents shell/file/MCP/automation capabilities.

## Entry 013 — Executable-mode census
- scripts/: 83 blobs, 9 executable.
- .github/scripts/: 8 blobs, 1 executable.
- .gemini/skills/: 32 blobs, 4 executable.
- No executable mode was observed in .github/actions.

## Entry 014 — Workflow/event threat model
- 49 workflow files were enumerated.
- Observed pull_request_target, workflow_run, issue_comment, repository_dispatch, scheduled, manual and release triggers.
- Observed chained_e2e write-all, Gemini issue/PR automation, release workflows and secret-bearing workflows.
- These create multiple independent paths from untrusted repository/issue input to privileged automation.

## Entry 015 — Historical execution evidence
- Actions API reported 724 workflow runs.
- Latest sampled scheduled runs were startup_failure.
- Historical execution volume is substantial enough to require systematic logs/artifacts review before declaring the execution plane clean.

## Entry 016 — Commit provenance
- Latest user-authored CCRB/Kailos commits are unsigned/unverified.
- Adjacent upstream Gemini CLI security-hardening commits are cryptographically verified.
- This is a provenance weakness, not evidence of malicious authorship.

## Entry 017 — Repository governance
- Repository metadata: public, unarchived, fork.
- Rulesets endpoint returned empty.
- Branch-protection endpoint is inaccessible to this integration (403), so enforcement remains UNVERIFIED.
- .allstar/branch_protection.yaml only logs.

## Entry 018 — SOP/tooling/subagent requirements
- Added SOP, ledger and findings artifacts to the quarantine branch.
- Identified need for repository-admin API coverage, workflow AST/data-flow analysis, action provenance/advisory correlation, artifact/cache mapping, SBOM/dependency analysis, AI prompt/skill/MCP trust scanning, immutable evidence custody, and isolated dynamic-analysis execution.
- Recommended read-only specialist subagents with no write authority, coordinated by an evidence custodian.
