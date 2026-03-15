## 2024-05-24 - [Avoid O(N log N) Date Parsing during sort in Angular]
**Learning:** Instantiating `new Date(a.date).getTime()` directly inside an array `.sort()` comparator creates an O(N log N) performance overhead, leading to significant CPU block when sorting large arrays (e.g. transactions).
**Action:** Always parse the dates once during an O(N) mapping phase (e.g. `.map(item => ({ ...item, parsedDate: new Date(item.date).getTime() }))`) and then use the cached value in the sort comparator `.sort((a, b) => b.parsedDate - a.parsedDate)`.
