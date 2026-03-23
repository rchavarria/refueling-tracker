import { Router } from "express";
import { monthlyAggregate, monthlyKmPerVehicle } from "../controllers/statistics.controller.js";

const router = Router();

router.get("/monthly-aggregate", monthlyAggregate);
router.get("/monthly-km-per-vehicle", monthlyKmPerVehicle);

export default router;

