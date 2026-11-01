# Working with Claude Code

2026-11-01 · built

LineupBridge is built with Claude Code inside written rules. Each file below holds one kind of
instruction. A guideline Claude can weigh goes in a doc or rule; a rule with no exceptions is enforced
by Claude Code itself (a hook or a permission), so it does not depend on the model remembering it.

## Method

1. Zoha and Claude write the product rules and the journey or page spec (`docs/1-product/`,
   `docs/3-journeys/`, `docs/5-pages/`). Decisions are recorded as they are made; the rest stays open.
2. Missing components or values go into the design system first (`docs/4-design-system/`).
3. A two-part prompt builds it: part 1 reads the code and reports states, words and mismatches
   without editing; part 2 builds after Zoha's go-ahead ([example](example-prompt.md)).
4. Reviewer agents check the change against the docs; Zoha checks it in the browser at four widths.

## Files

| File | Kind | What it does |
| --- | --- | --- |
| [`CLAUDE.md`](../../CLAUDE.md) | Loaded every session | Commands, how to work, docs control, gotchas. Short on purpose |
| [`.claude/rules/components.md`](../../.claude/rules/components.md) | Loaded for `src/components/**` | Docs first, props for text, states, accessibility |
| [`.claude/rules/styles.md`](../../.claude/rules/styles.md) | Loaded for `src/**/*.css` | Tokens only, mobile first, breakpoints |
| [`.claude/rules/copy.md`](../../.claude/rules/copy.md) | Loaded for translations and JS | No new words, Console overrides `en.json`, terms |
| [`.claude/skills/new-component/`](../../.claude/skills/new-component/SKILL.md) | Procedure | Rules entry → `components.html` → code → test → review |
| [`.claude/skills/page-spec/`](../../.claude/skills/page-spec/SKILL.md) | Procedure | Code and live text → states → spec in `docs/` |
| [`.claude/skills/grill-me/`](../../.claude/skills/grill-me/SKILL.md) | Procedure | Questions a plan one decision at a time |
| [`.claude/agents/design-system-reviewer.md`](../../.claude/agents/design-system-reviewer.md) | Read-only reviewer | Diff against rules, tokens, layouts, components |
| [`.claude/agents/spec-reviewer.md`](../../.claude/agents/spec-reviewer.md) | Read-only reviewer | Diff against the page or journey spec: structure, states, words, scope |
| [`.claude/agents/a11y-reviewer.md`](../../.claude/agents/a11y-reviewer.md) | Read-only reviewer | Diff against WCAG 2.2 AA |
| [`.claude/settings.json`](../../.claude/settings.json) | Enforced | Hooks below; `.env` cannot be read |
| [`.claude/hooks/protect-processes.sh`](../../.claude/hooks/protect-processes.sh) | Hook, before edits | Blocks edits to `ext/transaction-processes/` (deployed in Sharetribe; needs approval) |
| [`.claude/hooks/format.sh`](../../.claude/hooks/format.sh) | Hook, after edits | Prettier on each edited JS/CSS file |
| [`scripts/check-tokens.sh`](../../scripts/check-tokens.sh) | Hook, before Claude finishes | Fails on raw font, colour or spacing values in added CSS lines |

Reviewers run in their own context and never saw the conversation that produced the code, so they
check the result against the docs, not against the reasoning.

## Working files

Prompts, plans and design explorations are kept out of the repo in `.claude/work/` (gitignored).
Only the docs in `docs/` and the files above are the record.
