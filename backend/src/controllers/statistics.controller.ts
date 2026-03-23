import type { Request, Response } from "express";
import { getMonthlyAggregate, getMonthlyKmPerVehicle } from "../services/aggregate.service.js";

/** GET /api/statistics/monthly-aggregate — monthly aggregated statistics */
export async function monthlyAggregate(_req: Request, res: Response): Promise<void> {
  const data = await getMonthlyAggregate();
  res.json(data);
}

/** GET /api/statistics/monthly-km-per-vehicle — km per month broken down by vehicle */
export async function monthlyKmPerVehicle(_req: Request, res: Response): Promise<void> {
  const data = await getMonthlyKmPerVehicle();
  res.json(data);
}

