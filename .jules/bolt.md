## 2024-05-10 - Caution with widespread automated linting
**Learning:** Running `pnpm lint --fix` in the `server-nest` project can introduce massive formatting changes across the codebase that obscure the actual optimization and lead to PR rejection.
**Action:** Only target specific files (e.g., `pnpm lint src/path/to/file.ts`) or run linting without the `--fix` flag when working on targeted performance optimizations, to ensure the patch remains isolated and easily reviewable.
