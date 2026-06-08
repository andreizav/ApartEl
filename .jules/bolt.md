## 2024-05-18 - [Prisma N+1 Query Fix with UUIDs in loop]
**Learning:** When fixing N+1 sequential `this.prisma...create()` calls by switching to `createMany`, if the original model generated IDs manually via `Date.now()`, using that inside a loop building the batch array will create identical IDs (as the loop executes instantly), causing Prisma ID collisions and silent failures or crashes.
**Action:** Always import `crypto` and use `crypto.randomUUID()` when generating unique IDs rapidly in a loop for batched bulk insertion, avoiding sequence generators like `Date.now()`.
