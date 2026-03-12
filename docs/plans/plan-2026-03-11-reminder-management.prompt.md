# Plan: Reminder Management — Full Feature

CRUD de recordatorios vinculados a vehículos, con fecha, descripción, tipo (dropdown con 5 opciones), kilometraje (obligatorio) y estado habilitado/deshabilitado. Sección "Upcoming Reminders" en el Dashboard (incluye vencidos últimos 7 días). Redirección a `/vehicles/:id` tras crear, editar o eliminar un recordatorio.

## Steps — Shared

1. **Crear schema Zod** en `shared/src/schemas/reminder.ts`: `reminderTypeEnum` (`maintenance`, `registration`, `insurance`, `inspection`, `other`), `REMINDER_TYPE_LABELS` (mapa valor→label), `createReminderSchema` con `date` (string ISO), `description` (string min 1), `type` (enum), `mileage` (int positive **obligatorio**), `enabled` (boolean default true). Derivar `updateReminderSchema`, `reminderSchema` (con `id` + `vehicleId`), tipos `CreateReminder`, `UpdateReminder`, `Reminder`, `ReminderType`.

2. **Re-exportar** desde `shared/src/schemas/index.ts`: añadir `export * from "./reminder"`.

## Steps — Backend

3. **Añadir modelo Prisma `Reminder`** en `backend/prisma/schema.prisma`: `id`, `vehicleId` (FK), `date`, `description`, `type` (String), `mileage` (Int), `enabled` (Boolean default true), `onDelete: Cascade`. Añadir `reminders Reminder[]` en `Vehicle`. Ejecutar `npx prisma migrate dev --name add-reminders`.

4. **Crear controller** en `backend/src/controllers/reminders.controller.ts`: `listVehicleReminders` (todos los del vehículo, order date ASC), `getUpcomingReminders` (enabled=true, date ≥ hoy-7días, order date ASC, `include: { vehicle: true }`), `createVehicleReminder`, `updateReminder`, `deleteReminder`. Seguir patrón de errores Prisma de `refuelings.controller.ts`.

5. **Crear router** en `backend/src/routes/reminders.router.ts`: rutas anidadas `GET/POST /api/vehicles/:id/reminders` y planas `GET /api/reminders/upcoming`, `PUT /api/reminders/:id`, `DELETE /api/reminders/:id`. **Registrar** ambos en `backend/src/index.ts`.

6. **Añadir seed data** en `backend/src/prisma/seed.ts`: limpiar `Reminder` al inicio, crear 2-3 por vehículo con tipos variados, alguno con `enabled: false`.

## Steps — Frontend

7. **Crear API client** en `frontend/src/api/reminders.ts`: `fetchVehicleReminders`, `fetchUpcomingReminders`, `createReminder`, `updateReminder`, `deleteReminder`.

8. **Crear `ReminderForm`** en `frontend/src/components/ReminderForm.tsx`: react-hook-form + zodResolver, campo `type` como `<select>` con opciones de `REMINDER_TYPE_LABELS`, acepta `defaultValues` para modo edición.

9. **Crear `ReminderList`** en `frontend/src/components/ReminderList.tsx`: tabla con columnas type (label), date (dd/mm/yyyy), description, mileage, enabled (indicador visual). Botones Edit y Delete por fila. **Delete redirige a `/vehicles/:id`** tras confirmar eliminación.

10. **Crear `ReminderNewPage`** en `frontend/src/pages/ReminderNewPage.tsx`: ruta `/vehicles/:id/reminders/new`, tras crear redirige con `navigate(`/vehicles/${vehicleId}`)`.

11. **Crear `ReminderEditPage`** en `frontend/src/pages/ReminderEditPage.tsx`: ruta `/vehicles/:id/reminders/:reminderId/edit`, carga datos actuales, **tras guardar redirige a `/vehicles/${vehicleId}`**.

12. **Modificar `VehicleDetailPage`** en `frontend/src/pages/VehicleDetailPage.tsx`: añadir fetch de reminders, sección con `ReminderList` y botón "+ Add Reminder".

13. **Modificar `DashboardPage`** en `frontend/src/pages/DashboardPage.tsx`: añadir sección "Upcoming Reminders" con datos de `GET /api/reminders/upcoming`, mostrando nombre del vehículo.

14. **Añadir rutas** en `frontend/src/App.tsx`: `/vehicles/:id/reminders/new` y `/vehicles/:id/reminders/:reminderId/edit`.

## Contracts

### Zod Schemas (`shared/src/schemas/reminder.ts`)

**`reminderTypeEnum`**: `z.enum(["maintenance", "registration", "insurance", "inspection", "other"])`

**`REMINDER_TYPE_LABELS`**:

| Value          | Label          |
|----------------|----------------|
| `maintenance`  | Maintenance    |
| `registration` | Registration   |
| `insurance`    | Insurance      |
| `inspection`   | Inspection     |
| `other`        | Other          |

**`createReminderSchema`**:

| Campo         | Tipo                          | Validación                             |
|---------------|-------------------------------|----------------------------------------|
| `date`        | `z.string().date()`           | ISO format required                    |
| `description` | `z.string().min(1)`           | "Description is required"              |
| `type`        | `reminderTypeEnum`            | Must be one of the enum values         |
| `mileage`     | `z.number().int().positive()` | "Mileage must be a positive integer"   |
| `enabled`     | `z.boolean().default(true)`   | Defaults to true                       |

**`updateReminderSchema`**: `createReminderSchema.partial()`

**`reminderSchema`**: extends `createReminderSchema` con `id: z.number().int()` y `vehicleId: z.number().int()`

**Tipos exportados**: `CreateReminder`, `UpdateReminder`, `Reminder`, `ReminderType`

### Prisma Model (`backend/prisma/schema.prisma`)

```prisma
model Reminder {
  id          Int      @id @default(autoincrement())
  vehicleId   Int
  date        DateTime
  description String
  type        String
  mileage     Int
  enabled     Boolean  @default(true)
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
}
```

Vehicle añade: `reminders Reminder[]`

### API Endpoints

| Método   | Ruta                              | Response                              |
|----------|-----------------------------------|---------------------------------------|
| `GET`    | `/api/vehicles/:id/reminders`     | `Reminder[]`                          |
| `POST`   | `/api/vehicles/:id/reminders`     | `Reminder` (201)                      |
| `GET`    | `/api/reminders/upcoming`         | `(Reminder & { vehicle: Vehicle })[]` |
| `PUT`    | `/api/reminders/:id`              | `Reminder` (200)                      |
| `DELETE` | `/api/reminders/:id`              | 204                                   |

### Error Messages

| Situación                      | HTTP | Mensaje                    |
|--------------------------------|------|----------------------------|
| Vehicle ID inválido            | 400  | `"Invalid vehicle ID"`     |
| Reminder ID inválido           | 400  | `"Invalid reminder ID"`    |
| Vehículo no encontrado         | 404  | `"Vehicle not found"`      |
| Reminder no encontrado         | 404  | `"Reminder not found"`     |
| Validación Zod fallida         | 400  | `fieldErrors` del schema   |

### Frontend Redirections

- Crear recordatorio → `navigate(`/vehicles/${vehicleId}`)`
- Editar recordatorio → `navigate(`/vehicles/${vehicleId}`)`
- Eliminar recordatorio → `navigate(`/vehicles/${vehicleId}`)`

## Further Considerations

1. **Backlog update**: tras implementar, mover el item de reminders a la sección "Already implemented" en `docs/backlog.md` con la fecha.

