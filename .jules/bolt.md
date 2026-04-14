## 2024-05-18 - Optimize Bootstrap Data Fetching
**Learning:** Found an N+1 query loop fetching channelMappings and icalConnections per unit, and several root entity queries running sequentially during tenant bootstrap.
**Action:** Replaced sequential awaits with `Promise.all` and extracted IDs to batch nested queries using `in` operator, significantly reducing database round-trips.
