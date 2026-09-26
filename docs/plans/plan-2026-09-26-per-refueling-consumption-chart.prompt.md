# Plan: Dashboard Per-Refueling Consumption Chart

## Progress Tracking

| Step | Status | Notes |
|------|--------|-------|
| 1 | ✅ Completed | Shared Zod schema `perRefuelingConsumptionResponseSchema` |
| 2 | ✅ Completed | Backend service `getPerRefuelingConsumption` |
| 3 | ✅ Completed | Backend service tests |
| 4 | ✅ Completed | Controller and route `GET /api/statistics/per-refueling-consumption` |
| 5 | ✅ Completed | Frontend API function and `RefuelingConsumptionChart` component |
| 6 | ✅ Completed | Chart added to `DashboardPage` |

**Legend**: ⬜ Pending | 🟨 In Progress | ✅ Completed

## Why

The existing monthly L/100km chart averages all refuelings within a month, which hides the
variation between individual refuelings. The user wants to see the consumption of **each
refueling** over the last 12 months to spot outliers and trends at a finer granularity.

## Decision

- New endpoint `GET /api/statistics/per-refueling-consumption` returning
  `{ vehicles: string[], points: { date, vehicleIndex, litersPer100km, liters, kmTraveled }[] }`,
  with points ordered by date ASC.
- Reuse `getVehicleMonthlyData` in `aggregate.service.ts` (same 12-month window as the other
  dashboard charts: from the first day of the month 11 months ago). Its entries were extended
  with `date` and `litersPer100km`. The reference refueling before the window is still used, so
  the first in-range refueling gets a computed value.
- Refuelings whose consumption cannot be computed (first ever refueling, equal consecutive
  mileages) are **omitted** from the points.
- Frontend: `RefuelingConsumptionChart` line chart, one line per vehicle, sharing a category
  X axis built from the unique refueling dates (dd/mm/yyyy). Vehicles without a refueling on a
  given date get `null` and `spanGaps: true` joins their points. Tooltip shows L/100km, liters
  and km traveled.

## Rejected alternatives

- **Time scale X axis** (`chartjs-adapter-date-fns`): represents real distances between dates,
  but adds a new dependency. The category axis is enough for now.
- **Keeping `null` points as gaps**: would break lines with no useful information.
- **Exact "today minus 12 months" window**: inconsistent with the other dashboard charts.

## Out of scope

- Vehicle filter or custom date range.
- €/km per refueling.

