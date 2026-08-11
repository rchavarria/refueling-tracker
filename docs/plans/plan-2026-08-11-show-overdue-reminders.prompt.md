# Plan: Show overdue reminders on the dashboard

Date: 2026-08-11

## Why

A maintenance reminder for the Toyota was past due but did not show up on the
dashboard, even though the color rules mark overdue reminders in red.

Root cause: `getUpcomingReminders` in `backend/src/controllers/reminders.controller.ts`
filters reminders with `date: { gte: sevenDaysAgo }`. That condition applies to the
reminder's own date, so a reminder that became due more than 7 days ago falls outside
the window and disappears from the dashboard exactly when it is most urgent.

Reminders overdue by mileage were still visible because the query only filters by date.

## Decision

Remove the date filter entirely. The endpoint returns every reminder with
`enabled: true`, no matter how old its due date is. Users must not lose track of any
reminder; hiding one is an explicit user action: disable it, or edit it with a new
date/mileage.

Rejected alternatives:

- Keeping a wider past window (e.g. 12 months): still silently hides old reminders.
- `date >= today - 7 days OR date <= today`: logically covers the whole timeline,
  so it is equivalent to no filter but harder to read.

## Changes

1. `backend/src/controllers/reminders.controller.ts`
   - Drop `date: { gte: sevenDaysAgo }` and the `sevenDaysAgo` computation from
     `getUpcomingReminders`.
   - Keep `enabled: true`, `orderBy: { date: "asc" }` and `enrichVehicleWithMileage`.
   - Update the JSDoc to "all enabled reminders, including overdue ones".
2. `backend/src/controllers/reminders.controller.test.ts` (new)
   - Mock `../lib/prisma.js` with `vi.mock`.
   - Cover long-overdue, recently overdue and future reminders.
3. `docs/backlog.md`
   - Move the bug entry to "Already implemented" dated 2026-08-11.

## Out of scope

- No frontend changes: `getReminderColor` already returns red for negative `diffDays`.
- No visual distinction between "overdue" and "due soon": both stay red.
- No sorting changes: reminders keep ascending date order.
- Vehicle detail page keeps listing all reminders, unfiltered.

