# Plan: Dashboard Two-Column Layout

**Date**: 2026-03-31

**Goal**: Reorganize `DashboardPage` from a single vertical stack into a responsive two-column layout — reminders on the left, charts on the right — using Tailwind CSS grid. Pure frontend/layout change affecting only `DashboardPage.tsx`. No backend, shared schemas, or new dependencies needed.

## Capabilities

**Scope**: Modify the layout of `DashboardPage.tsx` using Tailwind CSS grid. Pure frontend change — no backend, no shared schemas, no new dependencies.

- **Two-column grid** on `lg` breakpoint and above (≥1024px), single column below.
- **Left column** (~5/12 width): `UpcomingReminders`.
- **Right column** (~7/12 width): `MonthlyKmChart` + `MonthlyConsumptionChart` stacked vertically.
- Charts auto-resize to their container thanks to Chart.js `responsive: true`.

**Will NOT cover**: Widening the `max-w-5xl` container, changing the `UpcomingReminders` table columns (that's a separate backlog item), or any backend changes.

### Acceptance criteria

1. On large screens (≥1024px), the dashboard shows two columns side by side.
2. Left column contains the reminders table; right column contains both charts stacked vertically.
3. On small screens (<1024px), columns stack vertically with reminders first, then charts.
4. Charts correctly fill the narrower right column without overflow.

## Components

- **Frontend**:
  - `frontend/src/pages/DashboardPage.tsx` — restructure the JSX layout.
- **Backend**: No changes.
- **Shared**: No changes.

## Interactions

- **Data flow**: No change — each component independently fetches its own data on mount.
- **Integration points**: None.

## Contracts

- **Types/DTOs**: No changes.
- **Validation**: No changes.
- **Error messages**: No changes.

## Steps

1. Edit `frontend/src/pages/DashboardPage.tsx`: Below the header `<div>`, replace the current vertical stack with a Tailwind CSS grid container using `grid grid-cols-1 lg:grid-cols-12 gap-6`. Place `<UpcomingReminders />` inside a `lg:col-span-5` div (left column) and both `<MonthlyKmChart />` and `<MonthlyConsumptionChart />` inside a `lg:col-span-7` div (right column). On small screens (`grid-cols-1`), the columns stack vertically with reminders first.
2. Verify charts resize: Run the app (`npm run docker:up`) and confirm both Chart.js charts correctly fill the narrower right column width at the `lg` breakpoint without overflow.
3. Update backlog: In `docs/backlog.md`, move the item "dashboard: organize in two columns…" to the "Already implemented" section with date `2026-03-31`.

## Notes

- The main container is `max-w-5xl` (1024px) set in `Layout.tsx`. With a 5/7 split, the left column gets ~427px and the right ~597px.
- The reminders table with 5 columns may feel tight at ~427px — this is partially addressed by the separate backlog item to reduce reminders columns to 3.
- If the container feels too narrow, consider temporarily bumping it to `max-w-6xl` (1152px) in `Layout.tsx`.
- Both chart components use `responsive: true` in their Chart.js options, so they will automatically resize.
- `UpcomingReminders` uses `overflow-x-auto` on the table wrapper, which handles horizontal overflow gracefully.

