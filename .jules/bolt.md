## 2024-05-18 - [Targeted Linting]
**Learning:** The `pnpm run lint` script in `server-nest` includes a global `--fix` flag that can cause widespread, unintended formatting changes across the repository.
**Action:** To safely lint and fix specific modifications without polluting the repository, run targeted linting via `npx eslint "path/to/modified/file.ts" --fix`.
