## 2026-02-16 - Missing Composite Indexes
**Learning:** SQLite with Prisma does not automatically optimize range queries or sorted filtering. Explicit composite indexes (e.g., `@@index([unitId, startDate, endDate])` for bookings) are crucial for performance.
**Action:** Always verify query patterns (filtering + sorting/range) and add corresponding composite indexes in `schema.prisma`.
