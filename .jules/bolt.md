## 2024-05-07 - [Optimize bootstrap N+1 loading issue]
**Learning:** When migrating N+1 loop database queries inside `getBootstrapData` to a single `.findMany({ where: { id: { in: ids } } })`, the SQLite Prisma operator `in` is safely handled even when `ids` is empty, simplifying the code further without manual array length checks.
**Action:** Use the `in` operator combined with array aggregation methods like `.flatMap` to rapidly dissolve N+1 relational querying bottlenecks while avoiding boilerplate checks.
