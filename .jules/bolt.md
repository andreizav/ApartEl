## 2024-05-22 - Optimizing Booking Overlaps with Composite Indexes
**Learning:** SQLite's query optimizer significantly benefits from composite indexes on `[unitId, status, startDate, endDate]` for range-based overlap checks. Single-column indexes on FKs (like `unitId`) are insufficient for high-frequency availability queries in this schema.
**Action:** Always prioritize composite indexes for range queries involving status and date filters in the `Booking` model.
