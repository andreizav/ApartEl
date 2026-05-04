const { performance } = require('perf_hooks');

// Simulating Prisma calls with synthetic delay to see the impact of parallelization
async function simulatePrismaCall(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

async function runSequential() {
  const start = performance.now();
  await simulatePrismaCall(10); // groups
  await simulatePrismaCall(5);  // bookings
  await simulatePrismaCall(15); // clients
  await simulatePrismaCall(5);  // staff
  await simulatePrismaCall(10); // transactions
  await simulatePrismaCall(5);  // inventory
  await simulatePrismaCall(5);  // tenantData
  const end = performance.now();
  console.log(`Simulated sequential execution time: ${(end - start).toFixed(2)} ms`);
}

async function runParallel() {
  const start = performance.now();
  await Promise.all([
    simulatePrismaCall(10), // groups
    simulatePrismaCall(5),  // bookings
    simulatePrismaCall(15), // clients
    simulatePrismaCall(5),  // staff
    simulatePrismaCall(10), // transactions
    simulatePrismaCall(5),  // inventory
    simulatePrismaCall(5),  // tenantData
  ]);
  const end = performance.now();
  console.log(`Simulated parallel execution time: ${(end - start).toFixed(2)} ms`);
}

async function main() {
  await runSequential();
  await runParallel();
}
main();
