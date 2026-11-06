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
3. **Draft the spec** in `.claude/work/specs/<page>.md` (gitignored; the repo is public and holds only
   decided docs):
   - first line: date · status `draft` · Figma · code
   - scope: what changes, what does not (text, keys, data loading, logic)
   - structure: elements top to bottom with existing content and the library component each uses
   - states and decisions; open questions go to `.claude/work/open-items.md`, not into the spec
4. **Use only the design system.** Every component, layout and value comes from
   `docs/4-design-system/`. A gap goes into `.claude/work/open-items.md`, not into the spec as an invented value.
5. **Record Zoha's decisions as rules** in the draft during the discussion.
6. When Zoha approves: move it to `docs/5-pages/<page>.md` (or `docs/3-journeys/`) with status
   `approved`, write "the product owner" instead of a name, and add it to the index in
   `docs/README.md`.
