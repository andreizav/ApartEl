## 2026-05-11 - [N+1 DB Query in Bootstrap Service]
**Learning:** Found N+1 query loops inside the bootstrap service, in both `getBootstrapData` (fetching channel mappings and ical connections) and `seedTenantData` (creating units, staff, transactions).
**Action:** Optimize by replacing loops with `in` operator array queries (e.g. `findMany({ where: { unitId: { in: unitIds } } })`) and Prisma bulk creates (`createMany`) to save on database roundtrips.
