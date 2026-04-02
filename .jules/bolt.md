## 2025-04-02 - [Resolve N+1 query and sequential waits in BootstrapService]
**Learning:** Initializing the app's full initial payload (`getBootstrapData`) via sequential `await`s and an embedded N+1 lookup loop significantly bottlenecks load time, especially due to database roundtrips for each mapping/ical lookup.
**Action:** Use `Promise.all` for all unrelated top-level entities, and gather parent IDs (e.g., `unitIds`) to fetch relations via Prisma's `in` operator instead of a loop to avoid N+1 issues and speed up the bootstrap response.
