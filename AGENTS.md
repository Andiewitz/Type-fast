# Type Fast Agent Workflow

All agents should follow the same workflow.

- Read the relevant files before editing anything.
- Keep the existing architecture. Prefer extending over replacing.
- Keep backwards compatibility unless the user explicitly asks to break it.
- Always rewrite or regenerate docs when behavior changes.
- Do not create throwaway files unless the user asks for them.
- Do not make broad changes across many unrelated files in one commit.
- Run tests locally after every meaningful change before committing.
- Prefer `go test`, `npm run test:user`, or the relevant test command.
- Keep commit messages short and descriptive.
- Use conventional commit style:
  - `Add ...`
  - `Fix ...`
  - `Refactor ...`
  - `Update ...`
  - `Document ...`
- Use `docs/` for all documentation:
  - Issues, Post-mortems, and Plans have their own dated templates.
  - Systems and Contributor Guides explain architecture and process.
  - Test docs go under `docs/tests-docs/`.
- Do not commit any secrets or raw environment files.
- If you see problems or complexity, report them to the user.
- Keep the repository tidily scoped: implementation, testing, and delivery.
- If a request is huge, break it into stages and state the plan before coding.
- When the rules are unclear, ask.

## Branches

- `main` is the integration branch and must stay releasable. Do not commit directly to `main`.
- Create a dev branch for every change: `dev/<topic>`, where `<topic>` is short, lowercase, and kebab-case (for example `dev/auth-ui`).
- Git branch names cannot contain `:`, so use `/` as the separator instead of `dev:(topic)`.
- Branch from an up-to-date `main`, keep one topic per branch, and delete the branch after it merges.

## Commits

- For feature work, keep each commit to at least 200 changed lines (insertions plus deletions from `git diff --stat`), aim for around 400, and treat roughly 600 as the ceiling. Small fixes and documentation updates are exempt from the minimum. Use judgment; the goal is reviewable commits, not an exact count.
- If a change is larger, split it into ordered commits on the same dev branch by layer (migration, service, HTTP, client, tests, docs) or into stacked pull requests.
- Keep generated files, lockfiles, and mechanical renames in a separate commit and call them out in the pull request description.
- Each commit should leave the branch buildable and the relevant tests passing.

## Pull requests

- Push the dev branch and open a pull request into `main`. The pull request is the request to merge, not approval to merge.
- Do not merge a pull request without the repository owner's explicit approval.
- Keep each pull request to one coherent change and list the tests run in the description.
- If a change outgrows one reviewable pull request, split it into stacked pull requests.
