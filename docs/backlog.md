# Backlog

- Manage reminders
  - In order to compute vehicle mileage-based reminders, we need to store the mileage at the time of each refueling. This will allow us to calculate the distance traveled since the last refueling and set up reminders accordingly.
  - Reminders first on Vehicle Detail Page, then the list of refuelings
- Manage maintenance records for vehicles (date, description, cost), show in vehicle detail page, calculate total maintenance cost per vehicle

## Already implemented

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
