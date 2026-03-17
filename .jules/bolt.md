## 2024-03-17 - Avoid UUID dependency for ID loops in Prisma Batching
**Learning:** Adding a `uuid` dependency just to avoid `Date.now()` collisions in a tight map loop for batch Prisma operations violates constraints against adding new dependencies.
**Action:** Append the array index to `Date.now()` (e.g., `id: \`tx-${Date.now()}-${i}\``) to ensure unique deterministic IDs within the loop without needing an external library.

## 2024-03-17 - Do not mass format the backend codebase
**Learning:** The `server-nest` project has inconsistent formatting (4 spaces vs 2 spaces). Running `pnpm lint` triggers `--fix` under the hood, formatting the entire application and polluting the PR with unrelated white-space diffs.
**Action:** Only format the exact files you've modified and double check the diff. Avoid running global lint/format commands.
