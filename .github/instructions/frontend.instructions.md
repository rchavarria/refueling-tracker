# 2. Frontend Instructions

You are building a React + TypeScript + Tailwind CSS + Vite frontend for vehicle and refueling management.

**Key Requirements**:

- Use React Router v6 for routes: `/` (dashboard), `/vehicles` (list), `/vehicles/:id` (detail), `/refuelings/new` (form)
- Create reusable Tailwind components: `VehicleForm`, `RefuelingForm`, `RefuelingList`, `Dashboard`
- Display "N/A" in tables when kilometers traveled is null (first refueling or equal consecutive mileages)
- Table columns: date (dd/mm/yyyy), liters, price (€), total km, km traveled, L/100km
- Integrate Chart.js for consumption timeline and cost/km bar charts on Dashboard
- Use Fetch API to consume `/api/*` endpoints from backend
- Validate forms with Zod schemas before submission
- Handle API errors gracefully with user-friendly messages
- Implement responsive design with Tailwind CSS breakpoints
