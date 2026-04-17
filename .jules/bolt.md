## 2024-04-17 - Optimize Bootstrap Data Fetch
**Learning:** The application's initial bootstrap phase suffered from sequential database queries and nested N+1 loop queries to collect channel and iCal integrations. SQLite and Prisma latency compound significantly on loop-based queries.
**Action:** Always collect nested relationship IDs during the initial mapping phase and batch subsequent fetches using Prisma's `in` operator combined with `Promise.all` for parallel execution of independent root queries.
