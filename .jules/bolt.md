
## 2024-05-24 - Prisma Nested Relation Filtering for Better Memory Usage
**Learning:** In Prisma + SQLite, retrieving deeply nested 1-to-many child arrays by fetching the entire parent hierarchy (`include: { units: { include: { channelMappings: true } } }`) and then iterating via `flatMap` or `.forEach` forces the entire relational tree into Node.js memory. This causes high serialization overhead, especially as the parent and intermediate entities (like `PortfolioGroup` and `Unit`) grow in size.
**Action:** Always prefer direct querying of the target entity using Prisma's nested relational filters (`where: { unit: { group: { tenantId } } }`) when only the child records are needed. This offloads the filtering to the database engine and significantly reduces application memory allocation.
