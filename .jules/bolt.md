
## 2024-05-03 - [Optimize getBootstrapData by Using Promise.all]
**Learning:** Found sequential await statements fetching root entities like `portfolioGroup`, `booking`, `client`, `staff`, `transaction`, `inventoryCategory`, and `tenant` in `server-nest/src/modules/bootstrap/bootstrap.service.ts`. This was causing N+1 query bottlenecks and unnecessary round-trips to the DB. Also discovered N+1 queries being issued inside loops to fetch `channelMappings` and `icalConnections` for units.
**Action:** Used `Promise.all` to fetch the root entities concurrently. To fix the N+1 inside loops, used `flatMap` to collect the IDs and fetched them in a single query using the Prisma `in` operator.
