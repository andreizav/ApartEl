
## 2024-03-16 - [Angular Signal/Computed Pre-computation Optimization]
**Learning:** Found an O(N*M) performance issue in a `computed` signal function calculating a calendar's daily availability where `Date` parsing and assignment operations inside `.find()` were repeated heavily (days * bookings).
**Action:** When working with nested loops inside a computed signal, always map the inner collection first into a numerical timestamp or format that can be simply compared inside the outer loop, changing O(N*M) parsing overhead to O(M) preprocessing + fast integer comparisons.
