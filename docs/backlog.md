# Backlog

## Already implemented

- 2026-04-01: dashboard, reminders: show just 3 columns: vehicle, date and mileage, show full description on hover via tooltip
- 2026-03-31: dashboard: organize in two columns, with reminders on the left and graphs on the right
- 2026-03-30: vehicle detail page: apply color rules to reminders (red, orange, green)
- 2026-03-25: dashboard: remove graphs by vehicle
- 2026-03-25: dashboard: line chart showing L/100km per vehicle per month for the last 12 months (one line per vehicle, no stacking, gaps for months without data)
- 2026-03-24: maintenances and reminders tables: limit description column width, trim with ellipsis, and show full description on hover via tooltip
- 2026-03-23: dashboard: show a graph of km traveled per month for the last 12 months, as a stacked 
  line graph with one line per vehicle, and a total line
- 2026-03-23: Refueling list by vehicle: sort by date descending (newest first), remove €/km column, show last 10 with "Show all" toggle
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
