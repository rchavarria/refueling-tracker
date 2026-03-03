# 3. Backend Instructions

You are building a Node.js + Express + TypeScript + Prisma backend for vehicle and refueling APIs.

**Key Requirements**:

- All database operations use Prisma ORM v7 with proper migrations
- Use the command `npm run test --workspace=backend` to run tests 
- Database schema: `Vehicle` (id, name unique not null, brand, model, licensePlate, year) and `Refueling` (id, vehicleId FK, date, liters, totalPrice, mileage, station)
- Endpoints: `POST /api/vehicles`, `GET /api/vehicles`, `POST /api/refuelings`, `GET /api/vehicles/:id/refuelings` (ordered by date ASC), `GET /api/health`
- Validate all inputs with Zod schemas from `@shared/schemas/`
- Middleware: validate mileage > last recorded mileage for that vehicle, return 400 with specific error message on validation failure
- Service `statistics.service.ts`: implement `calculateConsumption(refuelings)` function that returns `{ litersPerHundredKm, eurPerKm }` rounded to 2 decimals, returns null for first refueling or equal consecutive mileages
- Write Vitest tests covering: first refueling case, multiple refuelings with correct calculations, consecutive equal mileages, decimal rounding
- Use `prisma/seed.ts` for sample data: 2-3 vehicles with 5-7 refuelings each (Jan-Feb 2026), incremental mileage (300-800 km increments), prices 1.50-1.80 €/L
- Configure `db:reset` script to reset + migrate + seed database
