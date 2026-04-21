## 2025-05-18 - Bootstrap N+1 Queries
**Learning:** Found sequential `await` and loops fetching channels and icals per unit and N+1 in `seedTenantData`. Also sequential `getBootstrapData` independent queries are `await`ed one by one instead of `Promise.all`.
**Action:** Use `Promise.all` for independent root queries in `getBootstrapData`, and use Prisma's `in` for batching channel mappings and ical connections.
