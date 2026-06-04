
## 2026-06-04 - Optimize root entity fetching with Promise.all and Prisma 'in' operator
**Learning:** To eliminate N+1 queries and avoid slow sequential fetching in initialization services like `BootstrapService`, fetch all independent root entities concurrently using `Promise.all`. Additionally, avoid nested loops for related entity lookups (e.g., relations across groups and units) by flattening child IDs into an array and executing a single query with the Prisma `in` operator.
**Action:** Use `Promise.all` alongside batch operations for all multi-entity data hydration layers in initialization endpoints.
