## 2024-05-29 - Optimization of N+1 Queries in BootstrapService
**Learning:** Sequential await calls for independent root entities and looped await queries for child entities (channel mappings, ical connections) cause N+1 query bottlenecks and large round-trip times during application bootstrap.
**Action:** Use Promise.all to fetch independent entities concurrently and bulk batching ('in' operator) to fetch child entities.
