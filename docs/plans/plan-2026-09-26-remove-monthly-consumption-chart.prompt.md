# Plan: Remove Dashboard Monthly Consumption Chart

## Progress Tracking

| Step | Status | Notes |
|------|--------|-------|
| 1 | ✅ Completed | Frontend: remove `MonthlyConsumptionChart` and its API function |
| 2 | ✅ Completed | Backend: remove route, controller and service for monthly consumption |
| 3 | ✅ Completed | Shared: remove unused schemas/types and `totalKm` |
| 4 | ✅ Completed | Backend: simplify shared helper in `aggregate.service.ts` |
| 5 | ✅ Completed | Tests updated |
| 6 | ✅ Completed | Frontend: shared `VEHICLE_COLORS` palette |
| 7 | ✅ Completed | Backlog updated, lint/build/test pass |

**Legend**: ⬜ Pending | 🟨 In Progress | ✅ Completed

## Why

The dashboard shows two fuel consumption charts: L/100km per month and L/100km per refueling.
The per-refueling chart gives finer detail, so the monthly one adds noise. Only the
per-refueling chart is kept. The cleanup is also used to remove types and fields that no longer
have any consumer.

## Decision

- Remove `GET /api/statistics/monthly-consumption-per-vehicle` end to end: shared schema,
  service, controller, route, frontend API function and `MonthlyConsumptionChart` component.
- Remove `MonthlyKmPerVehicleRow` (unused) and `totalKm` from the monthly km response (the
  km chart never renders it).
- In `aggregate.service.ts`, drop the unused `cost` and `vehicleId` fields, stop exporting
  `MonthlyDataResult`, and rename the helper to `getVehicleRefuelingData`
  (`VehicleRefuelingEntry`, `VehicleRefuelingData`) since it is no longer monthly-specific.
- Keep `monthKey`: it is computed in local time while `date` is computed in UTC, so deriving
  one from the other could shift refuelings across month boundaries.
- Move the duplicated `VEHICLE_COLORS` palette to `frontend/src/utils/chartColors.ts`.

## Rejected alternatives

- **Deriving `monthKey` from `date`**: risk of time zone related month shifts.
- **Keeping `totalKm`** for a future total line: no current consumer; easy to re-add.

## Out of scope

- Changes to the km per month chart beyond removing `totalKm`.
- Changes to the per-refueling chart behaviour.


