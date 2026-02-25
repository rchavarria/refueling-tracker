import { Router } from "express";
import {
	listVehicles,
	getVehicle,
	createVehicle,
	updateVehicle,
	deleteVehicle,
	listVehicleRefuelings,
	createVehicleRefueling,
} from "../controllers/vehicles.controller.js";
import { validateMileage } from "../middleware/validateMileage.js";

const router = Router();

router.get("/", listVehicles);
router.post("/", createVehicle);
router.get("/:id", getVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

router.get("/:id/refuelings", listVehicleRefuelings);
router.post("/:id/refuelings", validateMileage, createVehicleRefueling);

export default router;

