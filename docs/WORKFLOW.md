# WORKFLOW — agents and token budget

## Roles
| Agent | Does | Never | Model |
|---|---|---|---|
| main (orchestrator) | picks next slice, delegates, relays short reports, asks human at gates | codes large changes itself | session model (Sonnet) |
| analyst | slice -> spec with ACs (docs/specs/<id>.md); vets dependencies | writes production code | sonnet |
| developer | implements the spec, minimal diff, runs typecheck/lint/changed tests | scope creep, skip lint, add deps silently | inherit |
| tester | tests from ACs, edge cases, manual QA checklist | edit production code | sonnet (haiku for run-only verification) |
Escalate to Opus (`/model`) only for architecture-heavy slices (S00, S10, S17) or when stuck after 2 loops.

## Slice loop
1. Main reads ROADMAP, picks the next unchecked slice (dependencies done).
2. **analyst** -> writes `docs/specs/<id>.md` (<=60 lines). Human skims; approves or edits (cheapest place to fix direction).
3. **developer** -> implements. 4. **tester** -> verifies. 5. Failures go back to developer (max 2 loops), then human.
6. Main reports in <=8 lines: result, files, risks. Human reviews diff, commits, runs `/clear`.
Skip analyst for trivial changes (<3 files, no new behavior). Never skip tester for domain or timer logic.

## Slice sizing
One behavior, <=~8 files, reviewable in <10 minutes. If bigger, analyst splits it.

## Spec template (docs/specs/<id>.md)
```
# <ID> <title>
Goal: one line.   Depends on: ids.   Docs to read: list.
In scope: bullets.   Out of scope: bullets.
Acceptance criteria:
 AC1 Given ... When ... Then ...
Edge cases: killed app / DST / double-tap / offline / empty / long text / font scale / themes / tr+en
Reuse: existing DS components, use-cases (from CATALOG.md)
New: only what is truly needed
Files likely touched: paths
Test notes: fakes needed, device-only checks
Assumptions: defaults chosen (analyst) 
Open questions: max 3 blocking
```

## Report formats (strict, short)
- analyst: spec path; scope in 1 sentence; <=3 open questions.
- developer: files changed; ACs covered; deviations + why; check results; areas to hammer. (<=12 lines)
- tester: per AC pass/fail; failing test + file:line + 1-line cause; tests added; gaps/device-only. (<=15 lines)

## Token rules (the whole team)
1. **Docs are on-demand.** CLAUDE.md stays small; subagents read only the docs named in their spec.
2. **Search, then read ranges.** Grep/Glob -> Read with offset/limit. Never read lockfiles, generated code, node_modules, Pods.
3. **Subagents absorb noise.** Test runs, exploration and dependency research happen in subagents; only summaries return.
4. **Narrow loops.** `test:changed`/single path while iterating; full `check` once.
5. **Edit, don't rewrite.** Small diffs also make review cheap.
6. **Reuse first.** CATALOG.md + use-case list prevent duplicate code (the biggest silent token cost).
7. **Fresh context per slice.** `/clear` after each slice; use `/compact` with a focus note only mid-slice.
8. **No chatter.** No restating tasks, no long plans, no changelog prose, no re-summarizing unchanged files.
9. **Stable prefix.** Avoid editing CLAUDE.md mid-session; put evolving info in docs/ROADMAP.md and specs.
10. **Pick the cheapest adequate model.** Sonnet default; Haiku for run-only; Opus for rare architecture calls.

## Suggested `.claude/settings.json` (create in S00; verify syntax with `/permissions`)
```json
{
  "permissions": {
    "allow": [
      "Bash(npm run typecheck)", "Bash(npm run lint)", "Bash(npm run check)",
      "Bash(npm run test *)", "Bash(npm run test:changed)",
      "Bash(git status)", "Bash(git diff *)"
    ],
    "deny": [
      "Read(./.env)", "Read(./.env.*)", "Read(./node_modules/**)", "Read(./ios/Pods/**)",
      "Read(./android/.gradle/**)", "Read(./android/build/**)", "Read(./package-lock.json)"
    ]
  }
}
```
Optional later: a PostToolUse hook that runs Prettier on edited files (needs `jq` or a node script; mind Windows).

## Definition of done (slice)
ACs pass (tester) • `npm run check` green • no new lint disables • DS rules respected (no literals/inline styles) •
CATALOG.md/DECISIONS.md updated if relevant • ROADMAP checkbox ticked • strings in tr+en • a11y checked in gallery or by test •
`npm run size` within budget when deps/assets/native config changed.

## Git
Branch per slice `slice/S07-feeding-timer`. Conventional Commits (`feat(feeding): ...`). One PR per slice, description = spec link + AC list.
