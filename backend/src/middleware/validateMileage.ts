import type { NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma.js";

/**
 * Middleware that validates the mileage of a new refueling is greater than
 * the last recorded mileage for the vehicle.
 * Expects `req.params.id` to be the vehicle ID and `req.body.mileage` to be set.
 */
export async function validateMileage(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const vehicleId = Number(req.params.id);

	if (Number.isNaN(vehicleId)) {
		res.status(400).json({ error: "Invalid vehicle ID" });
		return;
	}

	const newMileage = req.body?.mileage;

	if (typeof newMileage !== "number") {
		// Let the controller's Zod validation handle missing/invalid mileage
		next();
		return;
	}

	const lastRefueling = await prisma.refueling.findFirst({
		where: { vehicleId },
		orderBy: { mileage: "desc" },
		select: { mileage: true },
	});

	if (lastRefueling !== null && newMileage <= lastRefueling.mileage) {
		res.status(400).json({
			error: `Mileage must be greater than the last recorded (${lastRefueling.mileage} km)`,
		});
		return;
	}

	next();
}

