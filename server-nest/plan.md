## Problem
The `getBootstrapData` method in `server-nest/src/modules/bootstrap/bootstrap.service.ts` fetches data for multiple models sequentially using `await` inside a loop. Furthermore, the `channelMappings` and `icalConnections` fetch loops are classic N+1 queries.

```typescript
        const channelMappings: any[] = [];
        const icalConnections: any[] = [];

        for (const group of groups) {
            for (const unit of group.units) {
                const mappings = await this.prisma.channelMapping.findMany({
                    where: { unitId: unit.id }
                });
                channelMappings.push(...mappings);

                const icals = await this.prisma.icalConnection.findMany({
                    where: { unitId: unit.id }
                });
                icalConnections.push(...icals);
            }
        }
```
And earlier, there are sequential root entity requests:
```typescript
        // Get portfolio with units
        const groups = await this.prisma.portfolioGroup.findMany(...)
        // Get bookings
        const bookings = await this.prisma.booking.findMany(...)
        // Get clients with messages
        const clients = await this.prisma.client.findMany(...)
        // Get staff
        const staff = await this.prisma.staff.findMany(...)
        // Get transactions
        const transactions = await this.prisma.transaction.findMany(...)
        // Get inventory
        const inventory = await this.prisma.inventoryCategory.findMany(...)
```

## Proposed Optimization
1. Combine the sequential root entity calls into a single `Promise.all` block.
2. Resolve the nested loops for `channelMappings` and `icalConnections` by extracting `unitIds` from the `groups` array and performing two single bulk queries using `where: { unitId: { in: unitIds } }`.
3. Fetch `tenantData` concurrently as well if possible, or right after the first `Promise.all` block since it does not depend on other entities.

This reduces database roundtrips from `O(U)` (where U is number of units) to exactly `O(1)` parallel block.
