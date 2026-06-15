## 2024-06-15 - Prisma bulk fetch with `in` operator
**Learning:** In `getBootstrapData` (`BootstrapService`), doing a nested loop to query relational data sequentially via `findMany` (e.g. for `channelMappings` and `icalConnections`) introduces an N+1 queries issue, slowing down app initialization significantly for tenants with many units.
**Action:** Extract all target IDs (e.g., `unitIds`) upfront and use a single `findMany` with the `in` operator to fetch all child records at once, drastically reducing DB roundtrips.
