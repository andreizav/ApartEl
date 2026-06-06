## 2024-05-14 - [N+1 queries in Bootstrap Service]
**Learning:** Found and fixed an N+1 query vulnerability in `getBootstrapData` where queries were executed per unit inside a loop. This pattern is dangerous on SQLite as it significantly slows down serialization and connection setup overhead on larger payloads.
**Action:** Always refactor sequential loop queries that depend on relational models by aggressively mapping entity IDs and firing bulk `in` queries.
