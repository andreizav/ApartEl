## 2024-05-30 - Prisma N+1 in NestJS Bootstrap
**Learning:** In the NestJS backend (`BootstrapService`), doing a `.findMany` inside a nested for-loop over units completely blocks the event loop and causes severe N+1 database querying, especially noticeable on tenant initialization when fetching `ChannelMapping` and `IcalConnection`.
**Action:** Always collect nested entity IDs using `flatMap` and fetch their relationships concurrently using `Promise.all` alongside Prisma's `in` operator.
