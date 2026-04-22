## YYYY-MM-DD - Initial DB Optimization
**Learning:** Found sequential awaits in BootstrapService.getBootstrapData
**Action:** Replace with Promise.all to fetch independent entities concurrently
