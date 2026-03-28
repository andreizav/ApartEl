## 2024-05-18 - Bootstrap Service Refactor
**Learning:** Sequential database queries inside loops (N+1 query problem) and consecutive await statements for independent root entities heavily bottlenecked the `getBootstrapData` endpoint.
**Action:** Used `Promise.all` to fetch multiple independent root entities concurrently and replaced inner loop sequential lookups with array `map`/`flatMap` to collect IDs and execute a bulk `findMany` request with the `in` operator.
