## 2024-04-13 - Optimize Bootstrap Data Fetching
**Learning:** Initial application payloads (`BootstrapService.getBootstrapData`) had a significant N+1 query loop and sequentially fetched 7 independent root resources, introducing unnecessary database latency on startup.
**Action:** When fetching initial data payload, always map independent queries to an array of promises and use `Promise.all` to fetch concurrently. Address N+1 issues by collecting IDs with `flatMap` and querying using the `in` operator.
