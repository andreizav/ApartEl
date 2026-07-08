## 2024-07-08 - N+1 Query in Bootstrap Service
**Learning:** Found N+1 query in BootstrapService where channel mappings and iCal connections were queried inside a double loop (over groups, then over units). This is the initial data fetch and runs on every app start, so N+1 here is a major bottleneck.
**Action:** Extract all unit IDs using flatMap and query `ChannelMapping` and `IcalConnection` using an `in` clause to batch everything into two queries instead of 2 * numUnits queries. Also learned from memory that Promise.all can be used on root entities to fetch multiple models concurrently.
