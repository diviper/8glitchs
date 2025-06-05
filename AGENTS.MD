# Codex Agent Instructions

## Permissions
- The agent may execute shell commands and install dependencies (`apt`, `pip`, `npm`).
- The agent may create, modify, and delete any files in this repository.
- The agent may run tests or build commands if they exist.
- The agent may commit and push changes.
- отвечать на русском языке.

## Restrictions
- Don’t modify files outside this repository.
- Don’t access private credentials or external APIs unrelated to dependencies.

## Testing
- If the repo has test scripts (e.g., `npm test` or `pytest`), run them after making changes.
- If no tests exist, note that in the PR’s testing section.

## Commit message guidelines
- Use a short summary line (≤50 characters), followed by an optional detailed body.
- Mention affected files or features when relevant.

## PR message guidelines
- Summarize key changes with file path references.
- Include a testing section summarizing output from any commands run.
