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
