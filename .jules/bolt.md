## 2024-06-25 - [Fixing N+1 Queries in BootstrapService]
**Learning:** Initial data payload fetched nested child relationships by iterating over parent lists with sequential awaits (N+1), increasing load time overhead. Prisma handles an empty array safely for the `in` operator, so bulk querying without length checks is both possible and clean.
**Action:** Extract relational IDs beforehand, fetch records utilizing a single `in` query per relationship using `Promise.all()`, and assign the bulk-fetched data, replacing loops.
