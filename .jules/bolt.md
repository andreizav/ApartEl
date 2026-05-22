## 2024-05-15 - [Synchronous ID Generation Collisions]
**Learning:** When converting sequential async database calls (which take milliseconds each) into a synchronous batch operation (which takes microseconds to construct the payload), using `Date.now()` for ID generation will cause Primary Key collisions because multiple records are generated within the same millisecond.
**Action:** Always use a mathematically unique identifier like `crypto.randomUUID()` when generating IDs synchronously for batch operations, rather than time-based sequential generators.
