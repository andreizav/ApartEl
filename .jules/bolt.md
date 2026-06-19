## 2026-06-19 - Replaced N+1 Database Queries with Bulk IN fetch in NestJS
**Learning:** When retrieving relation data like channels and iCals for an array of grouped units in `getBootstrapData`, Prisma querying inside a nested loop causes a severe N+1 problem.
**Action:** Use array mapping functions (`flatMap`) to extract all unit IDs and execute independent requests through a single `Promise.all([prisma.channelMapping.findMany({ where: { unitId: { in: unitIds } } }), ...])`. This correctly reduces operations from (n)$ queries to just 2 bulk queries.
