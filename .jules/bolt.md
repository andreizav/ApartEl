# Bolt's Journal

## 2024-05-14 - Initial Setup
**Learning:** Created the journal file as it was missing.
**Action:** Always document critical learnings here.

## 2025-03-12 - Date Parsing Optimization in Array Sort
**Learning:** Found an `O(N log N)` `new Date()` allocation hidden inside a `.sort()` comparator on a computed property (`processedTransactions`) in Angular. This scales poorly with large transaction lists.
**Action:** Always calculate expensive properties like date parsing once during an `O(N)` mapping phase before sorting, rather than evaluating them dynamically within the sort comparator.