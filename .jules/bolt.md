
## 2024-05-25 - [Prisma findMany inside nested loops for bulk relation fetch]
**Learning:** Sequential `findMany` queries executed inside nested loops on Prisma creates severe N+1 problems. Resolving it by aggregating IDs into an array and executing a single `in` query drastically reduces query time, dropping latency significantly (e.g. from 141ms to 13ms in `getBootstrapData`). This is uniquely beneficial for relationships like `channelMappings` and `icalConnections` nested inside `unit` and `group` loops.
**Action:** When gathering relations from nested parent models, avoid database queries inside loops. Extract IDs using `flatMap`, and perform a single `findMany` bulk query using the `in` operator combined with `Promise.all` for independent models.
