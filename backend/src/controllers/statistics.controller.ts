import type { Request, Response } from "express";
import { getMonthlyAggregate } from "../services/aggregate.service.js";

/** GET /api/statistics/monthly-aggregate — monthly aggregated statistics */
export async function monthlyAggregate(_req: Request, res: Response): Promise<void> {
  const data = await getMonthlyAggregate();
  res.json(data);
}

