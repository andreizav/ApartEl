## 2024-05-24 - N+1 Queries in BootstrapService.getBootstrapData
**Learning:** Found nested loops making N*M queries for channel mappings and ical connections in `BootstrapService.getBootstrapData`, causing significant N+1 overhead at startup.
**Action:** Replace nested loop queries with a single query using Prisma `in` operator by collecting all unit IDs first.
