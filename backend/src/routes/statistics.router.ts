import { Router } from "express";
import {
  monthlyConsumptionPerVehicle,
  monthlyKmPerVehicle,
  perRefuelingConsumption,
} from "../controllers/statistics.controller.js";

const router = Router();

router.get("/monthly-km-per-vehicle", monthlyKmPerVehicle);
router.get("/monthly-consumption-per-vehicle", monthlyConsumptionPerVehicle);
router.get("/per-refueling-consumption", perRefuelingConsumption);

export default router;
