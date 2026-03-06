---
description: How to merge pull requests, including safeguards against merging into protected branches like main.
---

# PR Merge Workflow

When the user asks you to merge a Pull Request (PR), follow these steps strictly. This workflow ensures that we never accidentally merge incomplete or raw feature branches into protected branches like `main`.

1. **Identify the target branch**: First, check what branch the PR is targeting.
// turbo
```bash
gh pr view <PR_NUMBER> --json baseRefName -q .baseRefName
```
2. **Check the branch against the protected list**:
   - If the target branch is a protected/featured branch (e.g., `main`, `master`, `production`, `staging`), **DO NOT MERGE THE PR**. You do not have permission to merge directly into these branches.
   - If the user specifically asks you to complete the PR into a featured branch like `main`, respectfully decline and offer to create a Draft PR or let the user merge it manually.
3. **Merge for non-protected branches**:
   - If the base branch is a feature branch or personal branch (e.g., `eh/feat/*`, `feat/*`), you can merge the PR.
   - Run the appropriate `gh pr merge` command (e.g., `gh pr merge <PR_NUMBER> --squash --delete-branch`) but **NEVER** use `--admin` or override protections.
4. **Post-merge Sync**:
   - Offer to run the `/sync` skill or workflow to clean up the local repository after a successful merge.

Remember: Safety first. When in doubt, let the human click the merge button!