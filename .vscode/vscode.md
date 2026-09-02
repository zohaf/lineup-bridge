## Business Rules and Sharetribe Boundary

LineupBridge business rules and the underlying Sharetribe implementation are separate sources of truth.

### Business rules are authoritative for product behavior

Sharetribe's process, states, transitions, or capabilities do not define what LineupBridge should allow users to do.

If Sharetribe permits something that LineupBridge does not want to expose, implement the LineupBridge rule at the application/business layer rather than changing Sharetribe automatically.

### Sharetribe is authoritative for its own technical behavior

The agent must not modify the Sharetribe process, states, transitions, configuration, or other underlying Sharetribe behavior simply to make it match a LineupBridge business rule.

If the existing Sharetribe implementation does not support the required LineupBridge behavior, stop and explain the discrepancy.

### No unilateral changes across the boundary

The agent must NEVER silently:

* change a LineupBridge business rule to fit Sharetribe
* change Sharetribe behavior to fit a LineupBridge business rule
* add, remove, or modify Sharetribe transitions
* change Sharetribe process definitions
* reinterpret a business requirement based only on existing code
* introduce a new business rule based only on what Sharetribe happens to support

When a discrepancy is found:

```text
LineupBridge business requirement
        ↕
     discrepancy
        ↕
Sharetribe implementation
```

First identify and explain the discrepancy.

Then determine whether the correct solution is:

1. an application-level mapping,
2. an application-level guard,
3. a UI/business-rule implementation,
4. a change to the Sharetribe implementation,
5. or a change to the LineupBridge business rule.

### Approval requirement

If resolving the discrepancy would require changing either:

* the documented LineupBridge business rules, OR
* the Sharetribe process/state/transition/configuration,

STOP and ask the user for explicit approval before making that change.

Do not infer approval from the task itself.

### Default principle

```text
Business says WHAT LineupBridge should do.
Sharetribe defines WHAT the underlying system supports.
The mapping layer connects the two.
The agent must not silently change either side to accommodate the other.
```

When uncertain, preserve both sources of truth and ask before changing either one.
