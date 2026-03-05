## 2024-05-24 - [Avoid N+1 queries during data bootstrap]
**Learning:** In Prisma (and generally in ORMs), looping through a relation array and issuing a database query per item (e.g., `findMany` inside a `for` loop) creates a severe N+1 performance bottleneck that scales poorly with data size.
**Action:** Always fetch related data upfront using the `include` feature of Prisma, or use the `in` operator to fetch all needed records in a single query, and perform the data grouping/mapping in application memory.
