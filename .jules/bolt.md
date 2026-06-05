## 2024-06-05 - Batching Independent Prisma Queries
**Learning:** Sequential `await` statements for independent Prisma queries (e.g., fetching multiple root entities) introduce unnecessary latency due to sequential round-trips. Furthermore, nested queries within loops (N+1 problem) are a major bottleneck.
**Action:** Use `Promise.all` to fetch independent root entities concurrently. To resolve N+1 queries for nested relations, collect necessary identifiers (e.g., using `flatMap`) and fetch the related entities in a single bulk query using Prisma's `in` operator.
