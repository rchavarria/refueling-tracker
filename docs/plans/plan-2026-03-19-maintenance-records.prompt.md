# Plan: Vehicle Maintenance Records — Full Feature

CRUD de registros de mantenimiento vinculados a vehículos, con tipo (enum de 8 valores), fecha, kilometraje, descripción (obligatoria) y coste. Sección "Maintenances" en la página de detalle del vehículo (después de Refuelings). Sin presencia en Dashboard ni impacto en `currentMileage`.

## Steps — Shared

1. **Crear schema Zod** en `shared/src/schemas/maintenance.ts`: `maintenanceTypeEnum` (`ITV`, `AdBlue`, `Wheels`, `Oil`, `Lights`, `Brakes`, `Repair`, `Others`), `MAINTENANCE_TYPE_LABELS` (mapa valor→label), `createMaintenanceSchema` con `type` (enum), `date` (string ISO), `mileage` (int positive), `description` (string min 1), `cost` (number nonnegative). Derivar `updateMaintenanceSchema` (partial), `maintenanceSchema` (con `id` + `vehicleId`), tipos `MaintenanceType`, `CreateMaintenance`, `UpdateMaintenance`, `Maintenance`.

2. **Re-exportar** desde `shared/src/schemas/index.ts`: añadir `export * from "./maintenance"`.

## Steps — Backend

3. **Añadir modelo Prisma `Maintenance`** en `backend/prisma/schema.prisma`: `id`, `vehicleId` (FK), `date`, `type` (String), `description`, `mileage` (Int), `cost` (Float), `onDelete: Cascade`. Añadir `maintenances Maintenance[]` en `Vehicle`. Ejecutar `npx prisma migrate dev --name add_maintenances`.

4. **Crear controller** en `backend/src/controllers/maintenances.controller.ts`: `listVehicleMaintenances` (todos los del vehículo, order date DESC), `createVehicleMaintenance`, `updateMaintenance`, `deleteMaintenance`. Seguir patrón de errores Prisma de `reminders.controller.ts`.

5. **Crear router** en `backend/src/routes/maintenances.router.ts`: rutas anidadas `GET/POST /api/vehicles/:id/maintenances` y planas `PUT /api/maintenances/:id`, `DELETE /api/maintenances/:id`. **Registrar** ambos en `backend/src/index.ts`.

## Steps — Frontend

6. **Crear API client** en `frontend/src/api/maintenances.ts`: `fetchVehicleMaintenances`, `createMaintenance`, `updateMaintenance`, `deleteMaintenance`.

7. **Crear `MaintenanceForm`** en `frontend/src/components/MaintenanceForm.tsx`: react-hook-form + zodResolver, campo `type` como `<select>` con opciones de `MAINTENANCE_TYPE_LABELS`, campos date, description (obligatorio), mileage, cost. Acepta `defaultValues` para modo edición.

8. **Crear `MaintenanceList`** en `frontend/src/components/MaintenanceList.tsx`: tabla con columnas Type (label), Date (dd/mm/yyyy), Description, Mileage (con `km` y separadores de miles), Cost (con `€` y 2 decimales). Botones Edit y Delete por fila. **Delete redirige a `/vehicles/:id`** tras confirmar eliminación.

9. **Crear `MaintenanceNewPage`** en `frontend/src/pages/MaintenanceNewPage.tsx`: ruta `/vehicles/:id/maintenances/new`, tras crear redirige con `navigate(`/vehicles/${vehicleId}`)`.

10. **Crear `MaintenanceEditPage`** en `frontend/src/pages/MaintenanceEditPage.tsx`: ruta `/vehicles/:id/maintenances/:maintenanceId/edit`, carga datos actuales, **tras guardar redirige a `/vehicles/${vehicleId}`**.

11. **Modificar `VehicleDetailPage`** en `frontend/src/pages/VehicleDetailPage.tsx`: añadir fetch de maintenances, sección con `MaintenanceList` y botón "+ Add Maintenance". Orden de secciones: Reminders → Refuelings → **Maintenances**.

12. **Añadir rutas** en `frontend/src/App.tsx`: `/vehicles/:id/maintenances/new` y `/vehicles/:id/maintenances/:maintenanceId/edit`.

## Contracts

### Zod Schemas (`shared/src/schemas/maintenance.ts`)

**`maintenanceTypeEnum`**: `z.enum(["ITV", "AdBlue", "Wheels", "Oil", "Lights", "Brakes", "Repair", "Others"])`

**`MAINTENANCE_TYPE_LABELS`**:

| Value     | Label     |
|-----------|-----------|
| `ITV`     | ITV       |
| `AdBlue`  | AdBlue    |
| `Wheels`  | Wheels    |
| `Oil`     | Oil       |
| `Lights`  | Lights    |
| `Brakes`  | Brakes    |
| `Repair`  | Repair    |
| `Others`  | Others    |

**`createMaintenanceSchema`**:

| Campo         | Tipo                                    | Validación                                   |
|---------------|-----------------------------------------|----------------------------------------------|
| `type`        | `maintenanceTypeEnum`                   | Must be one of the enum values               |
| `date`        | `z.string().date()`                     | "Date must be a valid date string"           |
| `mileage`     | `z.number().int().positive()`           | "Mileage must be a positive integer"         |
| `description` | `z.string().min(1)`                     | "Description is required"                    |
| `cost`        | `z.number().nonnegative()`              | "Cost must be zero or a positive number"     |

**`updateMaintenanceSchema`**: `createMaintenanceSchema.partial()`

**`maintenanceSchema`**: extends `createMaintenanceSchema` con `id: z.number().int()` y `vehicleId: z.number().int()`

**Tipos exportados**: `MaintenanceType`, `CreateMaintenance`, `UpdateMaintenance`, `Maintenance`

### Prisma Model (`backend/prisma/schema.prisma`)

```prisma
model Maintenance {
  id          Int      @id @default(autoincrement())
  vehicleId   Int
  date        DateTime
  type        String
  description String
  mileage     Int
  cost        Float
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
}
```

Vehicle añade: `maintenances Maintenance[]`

### API Endpoints

| Método   | Ruta                                 | Response                |
|----------|--------------------------------------|-------------------------|
| `GET`    | `/api/vehicles/:id/maintenances`     | `Maintenance[]`         |
| `POST`   | `/api/vehicles/:id/maintenances`     | `Maintenance` (201)     |
| `PUT`    | `/api/maintenances/:id`              | `Maintenance` (200)     |
| `DELETE` | `/api/maintenances/:id`              | 204                     |

### Error Messages

| Situación                        | HTTP | Mensaje                                        |
|----------------------------------|------|------------------------------------------------|
| Vehicle ID inválido              | 400  | `"Invalid vehicle ID"`                         |
| Maintenance ID inválido          | 400  | `"Invalid maintenance ID"`                     |
| Vehículo no encontrado           | 404  | `"Vehicle not found"`                          |
| Maintenance no encontrado        | 404  | `"Maintenance not found"`                      |
| Validación Zod fallida           | 400  | `fieldErrors` del schema                       |
| Date inválido                    | 400  | `"Date must be a valid date string"`           |
| Description vacía                | 400  | `"Description is required"`                    |
| Mileage inválido                 | 400  | `"Mileage must be a positive integer"`         |
| Cost negativo                    | 400  | `"Cost must be zero or a positive number"`     |

### Frontend Error Messages

| Mensaje                                                      | Contexto                                  |
|--------------------------------------------------------------|-------------------------------------------|
| `"Failed to fetch maintenances for vehicle ${vehicleId}"`    | API client: fetchVehicleMaintenances      |
| `"Failed to delete maintenance ${id}"`                       | API client: deleteMaintenance             |
| `"No maintenances recorded yet."`                            | MaintenanceList: empty state              |
| `"Are you sure you want to delete this maintenance?"`        | MaintenanceList: confirm dialog           |
| `"Failed to load vehicle data"`                              | VehicleDetailPage: ya existente           |

### Frontend Redirections

- Crear mantenimiento → `navigate(`/vehicles/${vehicleId}`)`
- Editar mantenimiento → `navigate(`/vehicles/${vehicleId}`)`
- Eliminar mantenimiento → `navigate(`/vehicles/${vehicleId}`)` + `navigate(0)`

## Scope Exclusions

- **Sin presencia en Dashboard**: no se muestran datos de mantenimiento en el Dashboard
- **Sin impacto en `currentMileage`**: sigue derivándose exclusivamente de refuelings
- **Sin adjuntos**: no se permiten archivos/imágenes
- **Sin automatización**: no hay mantenimientos recurrentes (para eso están los Reminders)
- **Sin búsqueda/filtrado/ordenación**: tabla simple cronológica
- **Sin agregaciones de costes**: no se suman costes de mantenimiento en estadísticas

## Further Considerations

1. **Backlog update**: tras implementar, mover el item de maintenance records a la sección "Already implemented" en `docs/backlog.md` con la fecha.
2. **Orden de campos en formulario**: Type → Date → Description → Mileage → Cost.
3. **Cost permite cero**: para reparaciones en garantía (`nonnegative`, no `positive`).
4. **Type es enum, no texto libre**: el formulario usa un `<select>` dropdown con los 8 valores fijos.

