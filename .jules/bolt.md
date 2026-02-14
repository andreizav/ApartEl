## 2025-02-18 - Missing Foreign Key Indexes
**Learning:** The SQLite backend with Prisma does NOT create indexes for foreign keys automatically. This leads to full table scans on every `include: { relation }` or reverse lookup.
**Action:** Always verify `schema.prisma` has explicit `@@index([foreignKey])` for all relations in this codebase.

## 2025-02-18 - Composite Indexes for Sorted Queries
**Learning:** Prisma on SQLite requires composite indexes (e.g., `@@index([tenantId, date])`) for efficient `orderBy` operations on filtered queries. Single-column indexes are insufficient for `WHERE tenantId = ? ORDER BY date`.
**Action:** Identify filtered+sorted queries and add composite indexes.
