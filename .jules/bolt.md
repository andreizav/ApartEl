
## 2025-02-17 - Avoid Fetching Unnecessary Relational Trees

**Learning:** When fetching nested relation data (e.g. `channelMappings` belonging to a `unit` belonging to a `portfolioGroup`), fetching the entire tree and extracting the child elements in-memory causes significant memory overhead and unnecessary data serialization.
**Action:** Use a single `findMany` query with nested relational `where` clauses (e.g., `where: { unit: { group: { tenantId } } }`) to let the database filter and return only the exact entities needed. Additionally, batched operations (like loops of `upsert`s) should be wrapped in `prisma.$transaction([ ...promises ])` to reduce connection round-trips and optimize throughput.
