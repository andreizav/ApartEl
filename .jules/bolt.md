
## 2025-02-12 - Parallel DB Calls in getBootstrapData
**Learning:** Found sequential independent DB queries and N+1 looping over nested relations during application bootstrap phase in `bootstrap.service.ts`.
**Action:** Replace multiple uncoupled sequential queries with `Promise.all` and solve N+1 problems by extracting parent relationship IDs and utilizing batch fetching via Prisma's `in` operator. Prisma safely evaluates empty `in: []` arrays without error, making the array check optional.
