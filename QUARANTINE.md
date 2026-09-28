# REPOSITORY QUARANTINE — 2026-09-28

Status: SECURITY HOLD

This branch is a security quarantine snapshot. Automated execution has been disabled for the identified workflows. Source code is preserved for forensic review.

Known high-risk surfaces:
- AI trusted-workspace automation
- GitHub Actions executing npm/tsx code
- Gemini API credentials and automation PATs
- AI-controlled repository modifications
- package lifecycle scripts and executable Node.js tooling
- AI skills, commands, extensions, MCP, and repository configuration

Required before re-enabling automation:
1. Rotate/revoke automation credentials.
2. Review Actions, branch rules, CODEOWNERS, environments, webhooks, deploy keys, collaborators, and GitHub Apps.
3. Review historical workflow runs and artifacts.
4. Review dependency/supply-chain provenance.
5. Require explicit human security approval.

This marker does not certify the repository as clean.
