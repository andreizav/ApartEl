# Bolt's Journal

## 2026-02-02 - [Initial Setup]
**Learning:** Initializing Bolt's performance journal.
**Action:** Use this file to document critical performance learnings.

## 2026-02-02 - [Angular Template Performance]
**Learning:** Found O(N*M) filtering logic inside template loops (calling method with filter()).
**Action:** Use computed signals to pre-group data into Maps for O(1) lookup in templates.

## 2026-02-02 - [Prisma Foreign Key Indexes]
**Learning:** Prisma with SQLite does not auto-index foreign keys, leading to O(N) lookups for core relations like `Booking.unitId` and `Message.clientId`.
**Action:** Always add explicit `@@index` to foreign keys in `schema.prisma` for performance.
