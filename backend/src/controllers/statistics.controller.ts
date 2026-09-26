import type { Request, Response } from "express";
import {
  getMonthlyConsumptionPerVehicle,
  getMonthlyKmPerVehicle,
  getPerRefuelingConsumption,
} from "../services/aggregate.service.js";

/** GET /api/statistics/monthly-km-per-vehicle — km per month broken down by vehicle */
export async function monthlyKmPerVehicle(_req: Request, res: Response): Promise<void> {
  const data = await getMonthlyKmPerVehicle();
  res.json(data);
}

/** GET /api/statistics/monthly-consumption-per-vehicle — L/100km per month broken down by vehicle */
export async function monthlyConsumptionPerVehicle(_req: Request, res: Response): Promise<void> {
  const data = await getMonthlyConsumptionPerVehicle();
  res.json(data);
}

/** GET /api/statistics/per-refueling-consumption — L/100km for each refueling (last 12 months) */
export async function perRefuelingConsumption(_req: Request, res: Response): Promise<void> {
  const data = await getPerRefuelingConsumption();
  res.json(data);
}
