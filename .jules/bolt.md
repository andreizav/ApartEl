## 2025-02-18 - SQLite Composite Indexes
**Learning:** SQLite query performance benefits significantly from composite indexes on foreign keys combined with filter/sort columns (e.g., `[unitId, status, startDate, endDate]`). Default single-column foreign key indexes are insufficient for complex queries like overlap checks or sorted listings, leading to inefficient scans.
**Action:** Replace single-column foreign key indexes with composite indexes that include frequent filter and sort columns in `schema.prisma`.
