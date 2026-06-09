## 2025-02-27 - Solved N+1 query in BootstrapService
**Learning:** Found N+1 query inside a nested loop where channel mappings and iCal connections were being fetched one by one for each unit inside each portfolio group.
**Action:** Replaced the loop queries with flatMap to collect unitIds and performed a bulk query using the Prisma 'in' operator, coupled with Promise.all to fetch both concurrently. This reduces O(N) database queries to an O(1) bulk fetch.
