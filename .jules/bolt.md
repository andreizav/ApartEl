## 2024-05-23 - Batch Independent Queries & N+1 Fix in Bootstrap
**Learning:** Found N+1 queries in `BootstrapService.getBootstrapData` when resolving `channelMapping` and `icalConnection` per unit. Additionally, several root entity queries (`groups`, `bookings`, `clients`, `staff`, `transactions`, `inventory`, `tenantData`) were being executed sequentially, incurring unnecessary round-trip overhead.
**Action:** Used `Promise.all` to batch the independent root queries. Resolved the N+1 problem by extracting `unitIds` with `flatMap` and making bulk queries using Prisma's `in` operator.
