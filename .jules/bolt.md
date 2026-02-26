# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

This journal tracks critical performance learnings, bottlenecks, and unexpected behaviors discovered during optimization work.

## Format
`## YYYY-MM-DD - [Title]`
`**Learning:** [Insight]`
`**Action:** [How to apply next time]`

## 2025-02-12 - Missing Database Indexes
**Learning:** The database schema lacked indexes on frequently queried date ranges and sorting columns (`Booking.startDate`, `Booking.endDate`, `Transaction.date`), causing potential performance degradation as data volume grows.
**Action:** Always review `schema.prisma` against service usage patterns (especially `orderBy` and range filters) and add composite indexes where appropriate.
