## 2024-02-28 - SQLite Upsert Batching
**Learning:** Sequential `upsert` in loops with SQLite creates massive disk I/O overhead due to individual transactions per write.
**Action:** Always batch bulk upserts using `prisma.$transaction(items.map(...))` to ensure they run in a single SQLite transaction.
