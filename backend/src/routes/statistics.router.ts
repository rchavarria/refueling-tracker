import { Router } from "express";
import { monthlyAggregate, monthlyConsumptionPerVehicle, monthlyKmPerVehicle } from "../controllers/statistics.controller.js";

const router = Router();

router.get("/monthly-aggregate", monthlyAggregate);
router.get("/monthly-km-per-vehicle", monthlyKmPerVehicle);
router.get("/monthly-consumption-per-vehicle", monthlyConsumptionPerVehicle);

export default router;

