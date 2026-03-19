# Backlog

(empty)

## Already implemented

- 2026-03-19: Manage maintenance records for vehicles (type, date, mileage, description, cost), show in vehicle detail page
- 2026-03-12: Manage reminders
  - Tooltip on Dashboard about the color scheme for reminders (red, orange, green)
  - Reminders first on Vehicle Detail Page, then the list of refuelings
  - `currentMileage` as a derived property of `Vehicle` — every endpoint returning a vehicle now includes `currentMileage: number | null` (max mileage from refuelings). Dashboard reminder colors now use real km distance instead of hardcoded null.
- 2026-03-11: Manage reminders
  - Reminders on Dashboard, color scheme based on date/mileage proximity:
    - red: within 7 days or less than 1000 km away or overdue
    - orange: between 7 and 30 days or between 1000 and 3000 km away
    - green: more than 30 days or 3000 km away
- 2026-03-11: Manage reminders
  - Edit and Delete buttons on Vehicle Detail Page: they must be button-like, not just Link-like
- 2026-03-10: Manage reminders (maintenance, registration, insurance, official technical inspection) with date and description, show upcoming reminders in dashboard
- 2026-03-06: In the dashboard, show data for last 12 months, aggregate data for all vehicles:
  - Total km traveled
  - Total liters consumed
  - Total cost
  - Average L/100km
  - Average €/km
