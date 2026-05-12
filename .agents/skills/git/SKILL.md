---
name: git
description: Git commit and history-management workflow for this repository. Trigger whenever the user asks to commit, checkpoint, stage/unstage, amend, squash, split commits, rebase, or clean branch history. Enforce atomic commits, block W3C regressions, require explicit non-W3C waiver justification, and link regression-gate evidence to each commit.
---

# Git Commit Discipline (Checkpoint-Gated)

## Purpose
Create small, frequent commits while preventing regressions. Use a **checkpoint-first** workflow: commit tentatively, run the regression gate on the clean committed tree, then finalize or rollback based on the result. This ensures provenance always captures the exact committed SHA — never a stale or dirty-tree snapshot.

## Non-negotiable rules
1. Commit frequently, but keep each commit atomic (one coherent change).
2. Do not finalize a checkpoint if any mandatory-suite regression exists (W3C regressions are always blocking).
3. Non-W3C regressions should be fixed before finalizing; waiver is allowed only with explicit written justification.
4. Treat W3C suite `.xhtml` files as immutable; never modify them.
5. Only adjust Playwright assertions when they demonstrably mismatch the pass criteria in the corresponding W3C `.xhtml`.
6. Every finalized commit must be traceable to regression-gate artifacts via run directory + commit SHA metadata.

## Key concept: checkpoint commit
A checkpoint commit is a normal `git commit` that is treated as **tentative** until the regression gate blesses it.
- If the gate passes → the checkpoint becomes the final commit (optionally amended to add trailers).
- If the gate fails → roll back with `git reset --soft HEAD~1` (changes return to staged), fix, and re-checkpoint.

This eliminates the dirty-tree/clean-tree two-pass dance. Every gate run is against a real commit SHA on a clean tree.

## Commit workflow
1. **Define the next atomic slice**
   - Identify one logical change to commit now (fix, refactor step, test update, etc.).
2. **Confirm staging scope**
   - Run `git --no-pager status --short` and `git --no-pager diff --name-only` to see all pending changes.
   - Determine which files belong to this atomic slice:
     - If the agent made the changes, it already knows which files it edited.
     - If the user made the changes, ask the user to confirm which files to include (or accept an explicit scope the user provided, e.g. "commit only files in `src/xforms/`").
   - Untracked files and unrelated modifications must be excluded.
3. **Stage only relevant files**
   - Use narrow staging (`git add <specific-files>`); avoid bundling unrelated edits.
   - For partial-file staging, use `git add -p` when only some hunks in a file are relevant.
4. **Validate staged set**
   - Run `git --no-pager diff --name-only --cached` and confirm the staged files match the intended atomic slice.
   - If staged set includes `w3c-suite` `.xhtml` changes, unstage and revert those edits.
5. **Checkpoint commit**
   - Commit with a concise, scoped message: `git commit -m "<type(scope): summary>"`
   - This is a real commit. HEAD now points to it. The tree is clean.
6. **Run regression gate on checkpoint**
   - Execute the regression-gate process (compile, targeted tests when relevant, full gate comparison against baseline).
   - Provenance captures the checkpoint commit's SHA, branch, and clean tree state.
   - `related_commit_sha` is always the checkpoint SHA (never `null`).
7. **Interpret gate result**
   - **Gate passes (exit 0) + baseline promoted:**
     - The checkpoint is the final commit. Optionally amend to add gate trailers:
       - `Gate-Run: <run-dir>`
       - `Gate-Head: <sha>`
     - Proceed to next slice.
   - **Gate passes (exit 0) but no baseline promotion:**
     - Checkpoint stands. No trailer amendment needed unless desired.
   - **Mandatory-suite regression (exit 2):**
     - Roll back: `git reset --soft HEAD~1` (changes return to staged).
     - Fix the regression, then re-checkpoint from step 5.
   - **Non-mandatory regression (exit 3):**
     - Prefer rollback and fix.
     - If waiver is justified: amend the checkpoint with waiver rationale in the commit message or PR notes, then proceed.
8. **Repeat**
   - Continue with the next small slice; do not wait to batch many unrelated changes into one commit.

## Suggested command sequence
```bash path=null start=null
# 1. Survey pending changes
git --no-pager status --short
git --no-pager diff --name-only
# 2. Stage the atomic slice (confirm scope with user if needed)
git --no-pager add <relevant-files>
git --no-pager diff --name-only --cached
# 3. Checkpoint commit
git --no-pager commit -m "<type(scope): summary>"
# 4. Run regression gate (clean tree, captures checkpoint SHA)
# ... (see regression-gate skill for commands)
# 5a. Gate passed → optionally amend with trailers
git --no-pager commit --amend -m "<type(scope): summary" -m "Gate-Run: <run-dir>" -m "Gate-Head: <sha>"
# 5b. Gate failed → rollback, fix, re-checkpoint
git --no-pager reset --soft HEAD~1
```

## Failure handling
- If a mandatory (W3C) regression exists after checkpoint: roll back with `git reset --soft HEAD~1`, fix, and re-checkpoint.
- If only non-W3C regressions remain: prefer rollback and fix; finalize only when waiver justification is explicit and user-visible.
- If a commit would require violating these rules: stop and ask the user how to proceed.
