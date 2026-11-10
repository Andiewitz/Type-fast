# Type Fast Agent Workflow

All agents should operate the kit the same way.

- Read the relevant files before editing anything.
- Keep the existing architecture. Prefer extending over replacing.
- Compartmentalize UI by responsibility: keep page orchestration in pages, reusable interface elements in focused components, and feature-specific styles or logic alongside their components when practical. Avoid mixing unrelated concerns in one component.
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
- Do not open or merge a PR without the user's explicit approval.
- If you see problems or complexity, report them to the user.
- Keep the repository tidily scoped: implementation, testing, and delivery.
- If a request is huge, break it into stages and state the plan before coding.
- When the rules are unclear, ask.
