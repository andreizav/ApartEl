## 2024-05-29 - N+1 Bottlenecks in Bootstrapping
**Learning:** Sequential `.findMany()` and `.findUnique()` queries for independent root entities, alongside nested loop queries (N+1), can cause severe initialization latency in `BootstrapService.getBootstrapData()`.
**Action:** Use `Promise.all()` to fetch independent root entities concurrently. To resolve N+1 relations on nested structures (like `units` inside `portfolioGroups`), map the nested entities to an array of IDs and use the Prisma `in` operator to fetch all relations concurrently in bulk.
