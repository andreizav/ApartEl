## 2024-05-14 - Prisma Better-Sqlite3 Test Runner Limitations
**Learning:** Avoid testing Prisma database queries via custom standalone `.cjs` scripts in `server-nest` (like `test-perf.cjs`), as they often fail due to `PrismaClient` initialization and `better-sqlite3` native binding conflicts.
**Action:** Rely on the `sqlite3` CLI for database inspection or use the existing Jest test runner (`pnpm test`) to benchmark and verify query logic instead of creating ad-hoc `.cjs` scripts.
