# Plan: Truncate description columns with ellipsis & tooltip

**Date**: 2026-03-24

**Goal**: Limit the description column width in the maintenances and reminders tables so it doesn't push other columns off-screen, trim overflowing text with an ellipsis (`…`), and show the full description on hover via a native `title` tooltip.

## Capabilities

- **Scope**: Applies to the description `<td>` cells in three components: `MaintenanceList`, `ReminderList`, and `UpcomingReminders`. Pure frontend/CSS change — no backend, no shared schemas, no new dependencies.
- **Will NOT cover**: Custom styled tooltip components, description expansion on click, or any changes to backend/API/shared types.

### Acceptance criteria

1. Description cells have a constrained `max-width` (`max-w-xs` = 20rem / 320px) so other columns retain their space.
2. Text that overflows is hidden and replaced with an ellipsis (`…`).
3. Hovering over a truncated description shows the full text via the browser-native `title` attribute.
4. Behaviour is consistent across all three table components.

## Components

- **Frontend**:
  - `MaintenanceList.tsx` — description `<td>` (line 53)
  - `ReminderList.tsx` — description `<td>` (line 53)
  - `UpcomingReminders.tsx` — description `<td>` (line 109)
- **Backend**: No changes.
- **Shared**: No changes.

## Interactions

- **Data flow**: No change — descriptions are already fetched and rendered. Display-only change.
- **Integration points**: None.

## Contracts

- **Types/DTOs**: No changes.
- **Validation**: No changes.
- **Error messages**: No changes.

## Steps

1. Edit the description `<td>` in `MaintenanceList.tsx`: Add Tailwind classes `max-w-xs truncate` and `title={m.description}`.
2. Edit the description `<td>` in `ReminderList.tsx`: Add `max-w-xs truncate` and `title={r.description}`.
3. Edit the description `<td>` in `UpcomingReminders.tsx`: Add `max-w-xs truncate` and `title={r.description}`.
4. Update backlog: move item to "Already implemented".

