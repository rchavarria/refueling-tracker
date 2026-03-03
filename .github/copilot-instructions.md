# Main Instructions

## 1. General Project Guidelines

You are assisting with a full-stack TypeScript application: a Car Fuel Consumption Tracker Web Application.

The project uses a monorepo structure with `frontend/`, `backend/`, and `shared/` folders.

**Key Requirements**:

- All code, comments, documentation must be in English, even UI elements
- When working on frontend, use [`frontend.instructions.md`](./instructions/frontend.instructions.md) for specific guidelines
- When working on backend, use [`backend.instructions.md`](./instructions/backend.instructions.md) for specific guidelines
- All code must be in TypeScript with strict type checking enabled
- Use Zod schemas from `shared/schemas/` for data validation across frontend and backend
- Import shared types using `@shared/*` path alias
- Follow Biome linting rules for code style and formatting
- Use the command `npm run docker:up` to start the application with Docker Compose, and `npm run docker:down` to stop it
- Use the command `npm run test` to run tests 
- Use ISO format (YYYY-MM-DD) for API communication and dd/mm/yyyy for UI display in Spanish format
- Include clear error messages with specific context (e.g., "Mileage must be greater than the last recorded (X km)")
- Write Vitest tests for backend services and critical business logic
