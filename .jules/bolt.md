## 2024-04-25 - Bootstrap Service Database Bottleneck
**Learning:** Sequential await calls for root entities and iterative nested `findMany` or `.create` calls within loops create major N+1 initialization delays, particularly over SQLite which blocks.
**Action:** Replace sequential fetches and inserts with `Promise.all()` and batch fetch nested queries via `.flatMap` + `in` operators to improve bootstrapping / seed performance.
