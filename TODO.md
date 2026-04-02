# FlowAI Fix TODO (Based on Approved Plan)
Track progress here. Steps from priorities (1-6, no deletes except script.js per user).

## Priority 1-2 (Critical)
- [x] 1. Delete script.js (dead code)
- [x] 2. Add try/catch to loadTasks() - prevent crashes
- [x] 3. Add isValidTime() validator + use in add/edit

## Priority 2 (Core Logic)
- [x] 4. Add overlap check in addNewTask/handleEdit
- [x] 5. Dashboard: now <= taskEnd (edge case)
- [x] 6. DOM null checks (getElementById)

## Priority 3 (Architecture)
 - [x] 7. Refactor tasks → AppState object (replace all refs)
 - [x] 8. Sorting safety (validate before sort)

## Priority 4-6 (UX/Polish)
 - [x] 9. User feedback (UI message on add)
 - [x] 10. Duration already good

**Next**: Run commands, check off, test `open index.html`.

