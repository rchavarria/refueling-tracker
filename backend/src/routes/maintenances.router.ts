import { Router } from "express";
import {
	listVehicleMaintenances,
	createVehicleMaintenance,
	updateMaintenance,
	deleteMaintenance,
} from "../controllers/maintenances.controller.js";

/** Nested routes: mounted at /api/vehicles */
export const vehicleMaintenancesRouter = Router();
vehicleMaintenancesRouter.get("/:id/maintenances", listVehicleMaintenances);
vehicleMaintenancesRouter.post("/:id/maintenances", createVehicleMaintenance);

/** Flat routes: mounted at /api/maintenances */
export const maintenancesRouter = Router();
maintenancesRouter.put("/:id", updateMaintenance);
maintenancesRouter.delete("/:id", deleteMaintenance);

