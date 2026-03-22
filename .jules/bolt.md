
## 2024-05-20 - Batching heterogeneous operations to prevent N+1 Queries
**Learning:** Using `prisma.$transaction([ ...promises ])` allows for batch execution of heterogeneous database operations (e.g., mixing `create` and `update` across different models like `ChannelMapping` and `IcalConnection`). This eliminates significant overhead from SQLite disk synchronizations and multiple database round-trips caused by sequential calls inside a loop.
**Action:** Always inspect loops containing `await prisma...` operations and replace them with a `Promise.all()` or `$transaction([ ...promises ])` to batch database interactions efficiently. Track application layer state separately before/after the transaction.
