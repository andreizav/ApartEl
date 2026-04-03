## 2024-05-18 - Optimized N+1 Query in Bootstrap Service
**Learning:** Sequentially fetching child relations inside nested loops (e.g., querying mappings for each unit in a loop) leads to an N+1 queries bottleneck which impacts performance significantly during app startup as the database scales.
**Action:** Always collect IDs using methods like `flatMap` and perform a single bulk query using the `in` operator (e.g., `where: { unitId: { in: unitIds } }`) to resolve such N+1 query issues.
