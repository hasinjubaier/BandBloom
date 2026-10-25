---
trigger: always_on
description: "Never automatically run Git staging, commit, or push operations."
---

# Manual Git Workflow — BandBloom IELTS

The developer must remain in control of all Git staging, commits, and pushes.

## Strict rules

1. NEVER execute `git add`, `git commit`, or `git push` automatically.
2. NEVER create a Git commit, amend a commit, or push changes to any remote repository.
3. NEVER use alternative commands or scripts to perform staging, committing, or pushing indirectly.
4. Do not run Git commands that rewrite history or discard user changes, including `git reset --hard`, `git clean`, or destructive checkout operations, unless the user explicitly requests the specific operation.
5. You may inspect Git status, diffs, branches, and commit history using read-only commands.
6. After modifying project files, leave the changes in the working tree, unstaged and uncommitted.
7. Do not stage files automatically, even when implementation and tests pass.
8. At the end of each task, report the files changed and provide the recommended Git commands for the developer to execute manually.
9. Never interpret a request to implement, finish, test, document, or refactor a feature as permission to commit or push.
10. Only perform a Git staging, commit, or push operation when the developer explicitly requests that specific operation in the current conversation.

## Completion workflow

After completing a coding task:
- Run relevant checks when appropriate.
- Inspect `git status` and `git diff`.
- Leave all changes unstaged and uncommitted.
- Summarize the changes and test results.
- Let the developer decide when to stage, commit, and push.

These restrictions apply to all project tasks and take priority over ordinary instructions to complete or finalize code changes.
