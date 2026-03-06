import { Router } from "express";
import { monthlyAggregate } from "../controllers/statistics.controller.js";

const router = Router();

router.get("/monthly-aggregate", monthlyAggregate);

export default router;

