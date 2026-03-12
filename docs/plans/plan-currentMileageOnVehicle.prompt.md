# Plan: `currentMileage` as a Derived Property of `Vehicle`

## Feature name and goal

Enrich every `Vehicle` object returned by the API with `currentMileage: number | null`, calculated as the maximum mileage among the vehicle's refuelings, so the frontend can compute km-based reminder proximity without extra HTTP requests.

## Capabilities

**In scope:**
- Every endpoint that returns a vehicle (`GET /vehicles`, `GET /vehicles/:id`, `POST /vehicles`, `PUT /vehicles/:id`) will include `currentMileage`.
- The `vehicle` object embedded in `GET /api/reminders/upcoming` (which already does `include: { vehicle: true }`) will also include `currentMileage`.
- The frontend Dashboard will remove the hardcoded `null` and use `reminder.vehicle.currentMileage` to compute reminder colors.

**Out of scope:**
- No new database column — `currentMileage` is a computed field, not stored.
- No changes to the vehicle creation/edit flow.
- No changes to refueling endpoints.
- `POST /vehicles` and `PUT /vehicles/:id` will return `currentMileage: null` without an extra query (natural at creation/update time).

**Acceptance criteria:**
- `GET /api/vehicles` returns each vehicle with `currentMileage: number | null`.
- `GET /api/vehicles/:id` idem.
- `GET /api/reminders/upcoming` returns `reminder.vehicle.currentMileage` correctly.
- The Dashboard computes reminder colors using `currentMileage` instead of the hardcoded `null`.

## Components

### Shared (`shared/src/schemas/vehicle.ts`)
- Add `currentMileage: z.number().int().nullable()` to the existing `vehicleSchema`. Does not touch `createVehicleSchema` or `updateVehicleSchema`.

### Backend — new module (`backend/src/lib/vehicles.ts`)
- Export function `enrichVehicleWithMileage(vehicle)` that queries `prisma.refueling.aggregate({ _max: { mileage } }, where: { vehicleId })` and returns `{ ...vehicle, currentMileage: number | null }`.
- Single source of truth for this logic; any controller imports it from here.

### Backend (`backend/src/controllers/vehicles.controller.ts`)
- `listVehicles`: apply `Promise.all(vehicles.map(enrichVehicleWithMileage))`.
- `getVehicle`: apply `enrichVehicleWithMileage(vehicle)` before responding.
- `createVehicle` and `updateVehicle`: return `{ ...vehicle, currentMileage: null }` — no extra query, natural at this point.

### Backend (`backend/src/controllers/reminders.controller.ts`)
- `getUpcomingReminders`: after fetching reminders with `include: { vehicle: true }`, map each one enriching `reminder.vehicle` with `enrichVehicleWithMileage`.

### Frontend (`frontend/src/pages/DashboardPage.tsx`)
- Remove `const currentMileage = null` and the `TODO` comment.
- Use `reminder.vehicle.currentMileage` directly in `getReminderColor` — no changes to the existing color logic.

## Interactions

### Data flow — vehicle list

```
Frontend                        Backend                         DB
   │                               │                              │
   │  GET /api/vehicles            │                              │
   │──────────────────────────────▶│                              │
   │                               │  findMany(vehicles)          │
   │                               │─────────────────────────────▶│
   │                               │  aggregate(_max mileage)     │
   │                               │  × N vehicles (Promise.all)  │
   │                               │─────────────────────────────▶│
   │  Vehicle[] + currentMileage   │                              │
   │◀──────────────────────────────│                              │
```

### Data flow — upcoming reminders (Dashboard)

```
Frontend                        Backend                         DB
   │                               │                              │
   │  GET /api/reminders/upcoming  │                              │
   │──────────────────────────────▶│                              │
   │                               │  findMany(reminders)         │
   │                               │  include: { vehicle: true }  │
   │                               │─────────────────────────────▶│
   │                               │  aggregate(_max mileage)     │
   │                               │  × M reminders (Promise.all) │
   │                               │─────────────────────────────▶│
   │  Reminder[] with              │                              │
   │  vehicle.currentMileage       │                              │
   │◀──────────────────────────────│                              │
   │                               │                              │
   │  getReminderColor uses        │                              │
   │  vehicle.currentMileage       │                              │
   │  (no extra request)           │                              │
```

### Integration points

- `enrichVehicleWithMileage` in `backend/src/lib/vehicles.ts` is the single point that touches Prisma to compute `currentMileage` — any future endpoint imports from there.
- The shared `vehicleSchema` in `shared/src/schemas/vehicle.ts` is the contract between backend and frontend — adding `currentMileage` there propagates the type automatically to all pages using `Vehicle`.

## Contracts

### Types / DTOs

**`vehicleSchema`** (shared) — field added:
```
currentMileage: number (int) | null
```

Example `GET /api/vehicles` response:
```json
[
  {
    "id": 1,
    "name": "Family SUV",
    "brand": "Toyota",
    "model": "RAV4",
    "licensePlate": "1234ABC",
    "year": 2020,
    "currentMileage": 15350
  },
  {
    "id": 2,
    "name": "City Commuter",
    "brand": "Honda",
    "model": "Civic",
    "licensePlate": "5678DEF",
    "year": 2019,
    "currentMileage": null
  }
]
```

Example `GET /api/reminders/upcoming` response — field lives inside `vehicle`:
```json
[
  {
    "id": 3,
    "vehicleId": 1,
    "date": "2026-03-15",
    "description": "Oil change",
    "type": "maintenance",
    "mileage": 16000,
    "enabled": true,
    "vehicle": {
      "id": 1,
      "name": "Family SUV",
      "currentMileage": 15350
    }
  }
]
```

### Validation — Zod schema paths

| Schema | File | Change |
|---|---|---|
| `vehicleSchema` | `shared/src/schemas/vehicle.ts` | Add `currentMileage: z.number().int().nullable()` |
| `createVehicleSchema` | same file | No changes |
| `updateVehicleSchema` | same file | No changes |
| `reminderSchema` | `shared/src/schemas/reminder.ts` | No changes — `vehicle` is not part of the base schema |

### Error messages

No new error messages — `enrichVehicleWithMileage` does not throw its own exceptions; if Prisma fails, the error propagates to the existing global handler.

## Steps

1. Update `vehicleSchema` in [`shared/src/schemas/vehicle.ts`](../../shared/src/schemas/vehicle.ts) adding `currentMileage: z.number().int().nullable()`.

2. Create [`backend/src/lib/vehicles.ts`](../../backend/src/lib/vehicles.ts) with the `enrichVehicleWithMileage(vehicle)` function querying `prisma.refueling.aggregate({ _max: { mileage } })` by `vehicleId`.

3. Apply `enrichVehicleWithMileage` in [`backend/src/controllers/vehicles.controller.ts`](../../backend/src/controllers/vehicles.controller.ts): `Promise.all(...map)` in `listVehicles`, direct call in `getVehicle`, and `{ ...vehicle, currentMileage: null }` without query in `createVehicle` and `updateVehicle`.

4. Apply `enrichVehicleWithMileage` in [`backend/src/controllers/reminders.controller.ts`](../../backend/src/controllers/reminders.controller.ts): map each reminder enriching `reminder.vehicle` after the `include: { vehicle: true }`.

5. Remove the `TODO` and `const currentMileage = null` in [`frontend/src/pages/DashboardPage.tsx`](../../frontend/src/pages/DashboardPage.tsx), using `reminder.vehicle.currentMileage` directly in `getReminderColor`.

6. Update [`docs/backlog.md`](../backlog.md): remove the entry about storing mileage per refueling and register this feature under "Already implemented".

## Further Considerations

- `enrichVehicleWithMileage` fires one query per vehicle — in `listVehicles` they run in parallel via `Promise.all`, which is acceptable given the expected volume.
- The frontend `Vehicle` type updates automatically when the shared schema changes — no need to touch `frontend/src/api/vehicles.ts`.

