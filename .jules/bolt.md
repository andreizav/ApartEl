## 2026-04-18 - [Optimizing getBootstrapData with Promise.all and batch queries]
**Learning:** Found sequential independent database queries and nested loop N+1 queries in the heavy-lifting `getBootstrapData` service which retrieves the entire application state on startup.
**Action:** When creating aggregate initial data responses, always convert sequential, independent root queries into a single `Promise.all`, and extract nested relational dependencies using batch queries (`in` operator) instead of looping.
