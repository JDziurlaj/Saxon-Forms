---
name: git
description: Git commit workflow for this repository. Use this skill whenever the user asks to commit, checkpoint, split commits, or clean branch history. Enforce frequent atomic commits, block all W3C regressions, and require explicit justification for any non-W3C waiver.
---

# Git Commit Discipline (Test-Gated)

## Purpose
Create small, frequent commits while preventing regressions.

## Non-negotiable rules
1. Commit frequently, but keep each commit atomic (one coherent change).
2. Do not commit if any mandatory-suite regression exists (W3C regressions are always blocking).
3. Non-W3C regressions should be fixed before commit; waiver is allowed only with explicit written justification.
4. Treat W3C suite `.xhtml` files as immutable; never modify them.
5. Only adjust Playwright assertions when they demonstrably mismatch the pass criteria in the corresponding W3C `.xhtml`.

## Commit workflow
1. **Define the next atomic slice**
   - Identify one logical change to commit now (fix, refactor step, test update, etc.).
2. **Run regression gate before commit**
   - Execute the regression-gate process (compile, targeted tests when relevant, full gate comparison against baseline).
   - If any mandatory-suite regression exists, stop and fix before committing.
   - If a non-W3C regression waiver is used, ensure justification exists in run artifacts and include the rationale in commit/PR notes.
3. **Stage only relevant files**
   - Use narrow staging; avoid bundling unrelated edits.
4. **Validate staged set**
   - Confirm staged files match the intended atomic slice.
   - If staged set includes `w3c-suite` `.xhtml` changes, unstage and revert those edits.
5. **Commit**
   - Use a concise, scoped commit message.
   - Prefer one commit per completed, test-clean slice.
6. **Repeat**
   - Continue with the next small slice; do not wait to batch many unrelated changes into one commit.

## Suggested command sequence
```bash path=null start=null
git --no-pager status --short
git --no-pager diff --name-only
# run regression-gate steps here
git --no-pager add <relevant-files>
git --no-pager diff --name-only --cached
git --no-pager commit -m "<type(scope): summary>"
```

## Failure handling
- If a mandatory (W3C) regression exists: do not commit; report failures and fix first.
- If only non-W3C regressions remain: commit only when waiver justification is explicit and user-visible.
- If a commit would require violating these rules: stop and ask the user how to proceed.
