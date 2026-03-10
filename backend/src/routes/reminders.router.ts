import { Router } from "express";
import {
	listVehicleReminders,
	createVehicleReminder,
	getUpcomingReminders,
	updateReminder,
	deleteReminder,
} from "../controllers/reminders.controller.js";

/** Nested routes: mounted at /api/vehicles */
export const vehicleRemindersRouter = Router();
vehicleRemindersRouter.get("/:id/reminders", listVehicleReminders);
vehicleRemindersRouter.post("/:id/reminders", createVehicleReminder);

/** Flat routes: mounted at /api/reminders */
export const remindersRouter = Router();
remindersRouter.get("/upcoming", getUpcomingReminders);
remindersRouter.put("/:id", updateReminder);
remindersRouter.delete("/:id", deleteReminder);

