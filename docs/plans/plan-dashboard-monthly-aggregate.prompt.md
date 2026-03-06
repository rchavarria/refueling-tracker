# Plan: Dashboard Monthly Aggregate Statistics

Show aggregated fuel consumption data for the last 12 months on the Dashboard page, with one row per
month and data aggregated across all vehicles. A new backend endpoint computes the statistics using
the existing `calculateConsumption` function from `@shared/statistics`, and the frontend renders
a responsive table above the existing charts.

## Progress Tracking

| Step | Status | Notes |
|------|--------|-------|
| 1 | ⬜ Pending | Shared Zod schema for monthly aggregate |
| 2 | ⬜ Pending | Backend aggregate service |
| 3 | ⬜ Pending | Backend aggregate service tests |
| 4 | ⬜ Pending | Backend controller and router |
| 5 | ⬜ Pending | Frontend API function |
| 6 | ⬜ Pending | Frontend table in DashboardPage |

**Legend**: ⬜ Pending | 🟨 In Progress | ✅ Completed

## 1. Feature Name and Goal

**Name:** Dashboard Monthly Aggregate Statistics

**Goal:** Show aggregated fuel consumption data across all vehicles for the last 12 months on the
Dashboard page, giving the user a quick overview of total kilometers traveled, total liters consumed,
total cost, average L/100km, and average €/km — broken down by month.

## 2. Capabilities

**Scope:** Add a **monthly summary table** to `DashboardPage` showing the last 12 months, with one
row per month. Data is aggregated across **all vehicles** per month.

| # | Column | Calculation |
|---|--------|-------------|
| 1 | **Month** | Format "MMM YYYY" (e.g. "Feb 2026") |
| 2 | **Total km** | Sum of `kmTraveled` (from `calculateConsumption`) for all refuelings in that month, all vehicles |
| 3 | **Total liters** | Sum of `liters` for all refuelings in that month, all vehicles |
| 4 | **Total cost (€)** | Sum of `totalPrice` for all refuelings in that month, all vehicles |
| 5 | **Avg L/100km** | `(totalLiters / totalKm) × 100` for the month |
| 6 | **Avg €/km** | `totalCost / totalKm` for the month |

**Total km calculation:**
- Reuses `calculateConsumption` from `@shared/statistics` per vehicle.
- Includes the **last refueling before the range** as context so that `calculateConsumption` can
  compute `kmTraveled` for the first refueling inside the range.
- The resulting `kmTraveled` values are summed and grouped by month.

**Months with no km:** when `totalKm === 0`, L/100km and €/km are `null`, displayed as "N/A".

**New endpoint:** `GET /api/statistics/monthly-aggregate` — computed in backend, no parameters
(always last 12 months, all vehicles).

**Out of scope:**
- No individual vehicle filter.
- No custom date range filter.
- No per-vehicle breakdown (only monthly totals aggregated across all vehicles).

## 3. Components

### Shared — `shared/src/schemas/`

- New file `statistics.ts`: Zod schema `monthlyAggregateRowSchema` with fields
  `{ month, totalKm, totalLiters, totalCost, avgLitersPer100km, avgCostPerKm }`.
  Response schema `monthlyAggregateResponseSchema` as `z.array(monthlyAggregateRowSchema)`.
  Export inferred types `MonthlyAggregateRow` and `MonthlyAggregateResponse`.
- Update `shared/src/schemas/index.ts`: re-export `statistics.ts`.

### Backend

- New service `backend/src/services/aggregate.service.ts`:
  - Function `getMonthlyAggregate(): Promise<MonthlyAggregateRow[]>`.
  - Prisma query: all refuelings from all vehicles ordered by vehicle and date ASC. For each
    vehicle, also includes the last refueling **before** the 12-month range as a reference.
  - Runs `calculateConsumption` per vehicle.
  - Groups results by month (YYYY-MM), summing `kmTraveled`, `liters`, `totalPrice`.
  - Computes averages: `avgLitersPer100km = round2((totalLiters / totalKm) * 100)`,
    `avgCostPerKm = round2(totalCost / totalKm)`. If `totalKm === 0`, both are `null`.
  - Returns array of 12 rows ordered by month ASC.

- New test `backend/src/services/aggregate.service.test.ts`: covers — no data, one vehicle with
  refuelings across months, multiple vehicles, month with `totalKm === 0` → `null` averages,
  reference refueling before range used for first in-range refueling km calculation.

- New controller `backend/src/controllers/statistics.controller.ts`: handler `getMonthlyAggregate`
  calls the service and responds with JSON.

- New router `backend/src/routes/statistics.router.ts`: `GET /` → `getMonthlyAggregate`.

- Register in `backend/src/index.ts`: `app.use("/api/statistics", statisticsRouter)`.

### Frontend

- New API function `frontend/src/api/statistics.ts`: `fetchMonthlyAggregate()` calling
  `GET /api/statistics/monthly-aggregate`.

- Modify `frontend/src/pages/DashboardPage.tsx`: add a section **above** the existing charts with a
  responsive Tailwind table. 12 rows (most recent month first), columns: Month, Total km,
  Total liters, Total cost (€), Avg L/100km, Avg €/km. `null` values shown as "N/A". Numbers
  formatted to 2 decimals. Loaded on mount, independent of the vehicle selector.

## 4. Interactions (Data Flow)

### Dashboard load flow

```
DashboardPage (mount)
  ├─ fetchVehicles()              ──► GET /api/vehicles                      ──► vehicle list (existing)
  ├─ fetchMonthlyAggregate()      ──► GET /api/statistics/monthly-aggregate   ──► 12 aggregate rows (NEW)
  └─ fetchVehicleRefuelings(id)   ──► GET /api/vehicles/:id/refuelings       ──► charts (existing)
```

- `fetchVehicles()` and `fetchMonthlyAggregate()` are launched **in parallel** on mount.
- `fetchVehicleRefuelings(id)` fires when a vehicle is selected (existing behavior, unchanged).
- The aggregate table does **not** depend on the vehicle selector.

### Internal flow of `GET /api/statistics/monthly-aggregate`

1. **Controller** `getMonthlyAggregate` receives the request, delegates to the service.
2. **Service** `getMonthlyAggregate()`:
   - Computes the cutoff date: `today - 12 months` (e.g. 2025-03-01 if today is 2026-03-03).
   - Prisma query: all vehicles that have at least one refueling.
   - For each vehicle:
     - Fetches refuelings with `date >= cutoffDate`, ordered by `date ASC`.
     - Fetches the **last refueling before** `cutoffDate` (1 record, `date < cutoffDate`,
       ordered `date DESC`, `take: 1`) as a reference.
     - Combines `[reference, ...refuelings]` and runs `calculateConsumption()`.
     - Discards the reference record result (index 0).
     - Assigns each result to its corresponding month (`YYYY-MM` extracted from `date`).
   - Aggregates all vehicles by month:
     - `totalKm` = sum of `kmTraveled` (ignoring `null`).
     - `totalLiters` = sum of `liters`.
     - `totalCost` = sum of `totalPrice`.
   - Computes averages per month:
     - If `totalKm > 0`: `avgLitersPer100km = round2((totalLiters / totalKm) * 100)`,
       `avgCostPerKm = round2(totalCost / totalKm)`.
     - If `totalKm === 0`: both `null`.
   - Fills months with no data: `{ totalKm: 0, totalLiters: 0, totalCost: 0,
     avgLitersPer100km: null, avgCostPerKm: null }`.
   - Returns array of 12 rows ordered by month ASC.
3. **Controller** responds with `200 OK` and the JSON array.

### UI states

- **Loading:** shows "Loading..." while `fetchMonthlyAggregate` resolves.
- **No data:** if all 12 rows are empty, shows "No refueling data available for the last 12 months."
- **With data:** table rendered with 12 rows.

## 5. Contracts

### DTO — `MonthlyAggregateRow`

Defined in `shared/src/schemas/statistics.ts`:

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `month` | `string` | `"2026-02"` | ISO `YYYY-MM` format, formatted to "Feb 2026" in frontend |
| `totalKm` | `number` | `1250` | Sum of `kmTraveled` across all vehicles for that month |
| `totalLiters` | `number` | `98.5` | Sum of liters |
| `totalCost` | `number` | `148.75` | Sum of `totalPrice` in € |
| `avgLitersPer100km` | `number \| null` | `7.88` or `null` | `null` if `totalKm === 0` |
| `avgCostPerKm` | `number \| null` | `0.12` or `null` | `null` if `totalKm === 0` |

### Response `GET /api/statistics/monthly-aggregate`

- `200 OK` — `MonthlyAggregateRow[]` (always 12 elements, ordered by `month` ASC).
- No input parameters, no validation errors possible.
- If no data, returns 12 rows with values at 0 and averages `null`.

### Validation — Zod schemas in `shared/src/schemas/statistics.ts`

- `monthlyAggregateRowSchema`: `z.object({ month: z.string(), totalKm: z.number(),
  totalLiters: z.number(), totalCost: z.number(), avgLitersPer100km: z.number().nullable(),
  avgCostPerKm: z.number().nullable() })`
- `monthlyAggregateResponseSchema`: `z.array(monthlyAggregateRowSchema)`

### Display format in frontend

| Column | Format |
|--------|--------|
| Month | "Feb 2026" (short English month name + year) |
| Total km | Integer with thousands separator: `1,250 km` |
| Total liters | 2 decimals: `98.50 L` |
| Total cost | 2 decimals: `148.75 €` |
| Avg L/100km | 2 decimals or "N/A": `7.88` |
| Avg €/km | 2 decimals or "N/A": `0.12` |

### Error messages

| Situation | Message |
|-----------|---------|
| Fetch fails | `"Failed to load monthly statistics"` |
| No data (12 empty months) | `"No refueling data available for the last 12 months."` |

