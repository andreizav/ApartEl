## 2026-05-19 - [SQLite N+1 Optimization in getBootstrapData]
**Learning:** Found an N+1 query issue in `BootstrapService.getBootstrapData` where `channelMapping` and `icalConnection` were fetched sequentially inside nested loops over groups and units.
**Action:** Replaced the loops by extracting `unitIds` using `flatMap` and executed single batch queries using Prisma's `in` operator, reducing execution time significantly.
