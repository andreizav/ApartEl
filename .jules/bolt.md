## $(date +%Y-%m-%d) - Optimize getBootstrapData N+1 query and concurrency
**Learning:** `getBootstrapData` is the primary initialization path, and the nested loops for fetching child relations (like `channelMappings` and `icalConnections`) for each unit create severe N+1 query problems on app start.
**Action:** When fetching nested relations for a list of entities in Prisma, always flatten the parent IDs (`flatMap`) and use the `in` operator combined with `Promise.all` to batch the queries into a single database round-trip.
