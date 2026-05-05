## 2025-02-28 - SQLite Promise.all Optimization
**Learning:** In the `server-nest` initialization path (`BootstrapService.getBootstrapData`), executing numerous independent, sequential `await` calls against SQLite introduces substantial serialization delay and N+1 looping issues (e.g., inside the portfolio array).
**Action:** Consistently combine independent root entity lookups into a single `Promise.all` block, and extract foreign keys to replace inner loops with `where: { ...: { in: ids } }` batch queries to minimize network and database round trips.
