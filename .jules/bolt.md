## 2024-06-25 - Promise.all and Prisma `in` operator optimization
**Learning:** Sequential Prisma queries and loops causing N+1 problems in initialization methods (like `getBootstrapData`) can be optimized by batching them using `Promise.all` and the Prisma `in` operator. Prisma safely handles empty arrays for the `in` operator, meaning we do not need explicit length checks.
**Action:** Always check initialization methods (`getBootstrapData`, `seedTenantData`) for sequential independent queries and N+1 loop structures, and optimize them using `Promise.all` and batched `in` queries.
