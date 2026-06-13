## 2026-06-13 - [BootstrapService N+1 Optimization]
**Learning:** The getBootstrapData function contained a hidden N+1 query loop for channelMappings and icalConnections that executed two queries *per unit* loaded, which scaled terribly with larger portfolios.
**Action:** Always look for nested 'for' loops containing Prisma 'findMany' queries during initialization paths; these can almost always be optimized out by collecting all foreign keys (e.g., using 'flatMap') and executing a single bulk query with the Prisma 'in' operator.
