
## 2024-05-18 - [Optimized BootstrapService `getBootstrapData` parallelization and removed N+1 queries]
**Learning:** Found an N+1 query problem where `BootstrapService.getBootstrapData` iteratively fetched `channelMappings` and `icalConnections` for every unit individually. Furthermore, numerous uncoupled data fetching operations were run sequentially instead of concurrently.
**Action:** Replaced sequential queries for independent entities with a single `Promise.all`. Extract the unit loop into bulk fetches using the `in` operator (e.g. `where: { unitId: { in: allUnitIds } }`), which substantially minimizes both query overhead and total loading time.
