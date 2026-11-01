---
name: page-spec
description: Write or update a page or journey spec in docs/ from the code and the approved design. Use before building or redesigning a page.
---

A spec records what the page is, from the code as it is today and the decisions Zoha makes. It is
written before any build prompt.

1. **Read the code** for the page: the container, its `.duck.js`, the components it renders, and the
   translation keys it uses. Fetch the live Console translations; they override `en.json`.
2. **List the states** (user type × listing or transaction state × empty, error, loading) and what
   each shows today: words with their keys, buttons, link targets.
3. **Write the spec** in `docs/5-pages/<page>.md` (or `docs/3-journeys/<journey>.md`):
   - first line: date · status `draft` · design · code
   - scope: what changes, what does not (text, keys, data loading, logic)
   - structure: elements top to bottom with existing content and the library component each uses
   - states, decisions (with who decided), open items
4. **Use only the design system.** Every component, layout and value comes from
   `docs/4-design-system/`. A gap goes under open items, not into the spec as an invented value.
5. **Record Zoha's decisions as rules** in the spec during the discussion; keep the rest as open items.
   Set the status to `approved` only when Zoha says so.
6. Add the spec to the index in `docs/README.md`.
