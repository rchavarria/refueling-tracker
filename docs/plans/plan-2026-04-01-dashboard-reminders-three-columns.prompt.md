# Plan: Dashboard Reminders — Reduce to 3 Columns with Tooltip

**Date**: 2026-04-01

**Goal**: Reduce the `UpcomingReminders` table from 5 columns (Vehicle, Type, Date, Description, Mileage) to 3 (Vehicle, Date, Mileage) to better fit the ~427px left column in the dashboard's two-column layout. The removed information (type + description) is shown on row hover via the native `title` tooltip.

## Capabilities

**Scope**: Modify the `UpcomingReminders` component in `frontend/src/components/UpcomingReminders.tsx`. Pure frontend/layout change — no backend, no shared schemas, no new dependencies.

- Remove "Type" and "Description" columns from the table header and body.
- Add a native `title` tooltip on each `<tr>` row combining the type label and full description.
- Cleanup unused imports to satisfy Biome linting rules.

**Will NOT cover**: Custom styled tooltips (Headless UI, CSS-only), backend changes, or modifications to other components like `ReminderList` (vehicle detail page).

### Acceptance criteria

- The dashboard reminders table shows exactly 3 columns: Vehicle, Date, Mileage.
- Hovering over any row shows a tooltip with the format: `"Type — Description"` (e.g., "Insurance — Annual policy renewal").
- The existing color system (red/orange/green rows + badge dots) is preserved.
- No Biome lint warnings for unused imports.
- The table fits comfortably in the ~427px left column of the dashboard layout.

## Components

| Component | File | Change |
|---|---|---|
| `UpcomingReminders` | `frontend/src/components/UpcomingReminders.tsx` | Remove Type and Description columns, add row tooltip |

## Steps

1. **Remove "Type" and "Description" `<th>` cells** from `<thead>` in `UpcomingReminders.tsx`. Keep only Vehicle, Date, and Mileage headers.

2. **Remove "Type" and "Description" `<td>` cells** from `<tbody>` in `UpcomingReminders.tsx`. Keep only the Vehicle link, Date (with color badge), and Mileage cells.

3. **Add a `title` tooltip on each `<tr>`** combining type label and description:
   ```tsx
   title={`${REMINDER_TYPE_LABELS[r.type as ReminderType]}${r.description ? ` — ${r.description}` : ""}`}
   ```
   This preserves the context lost by removing the two columns.

4. **Verify imports**: `REMINDER_TYPE_LABELS` and `ReminderType` are still needed for the tooltip string, so no imports become unused. Double-check with Biome after editing.

5. **Update backlog** in `docs/backlog.md`: Move the item from pending to "Already implemented" with date `2026-04-01`.

## Notes

- The native `title` attribute is the simplest approach and consistent with the existing pattern already used on description cells in `ReminderList` and `MaintenanceList` (see truncate plan from 2026-03-24).
- A styled tooltip (e.g., Headless UI or CSS-only) would be nicer but adds complexity — recommend sticking with native `title` for now.
- No test changes needed: this is a display-only change in a single component with no business logic impact.
- No backend changes needed: the API already returns all fields; we simply stop displaying two of them as columns.

