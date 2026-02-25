## 2025-05-18 - SQLite Composite Indexes
**Learning:** SQLite's query planner (and Prisma's abstraction) relies heavily on explicit composite indexes for queries involving both equality and range filters (e.g., booking overlaps). Single-column indexes are often insufficient for performance.
**Action:** Replace single-column indexes with composite indexes (e.g., `@@index([unitId, status, startDate, endDate])`) when multiple fields are frequently used in `where` clauses.
