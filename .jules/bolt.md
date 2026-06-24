## 2026-06-24 - N+1 Query in BootstrapService
**Learning:** Found nested loops inside `groups.units` that triggered sequential Prisma `findMany` calls. Prisma safely resolves `in: []` so it's very easy to just use `Promise.all` and the `in` operator to execute bulk lookups.
**Action:** When working on APIs returning nested relations, watch out for loops wrapping `findMany`. Use `flatMap` to pull out IDs and perform concurrent `in` queries.
