## 2026-06-01 - [N+1 DB Query in Application Bootstrap]
**Learning:** Nested relational database lookups during initialization processes (like fetching units for a tenant, then mappings for each unit in a loop) create hidden but severe N+1 latency blocks.
**Action:** Always extract parent identifiers using map/flatMap and use the 'in' operator to perform a single batch query for child records instead of querying inside a loop.
