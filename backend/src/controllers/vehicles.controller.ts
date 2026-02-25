import type { Request, Response } from "express";
import { createVehicleSchema, updateVehicleSchema } from "@shared/schemas/vehicle.js";
import { createRefuelingSchema } from "@shared/schemas/refueling.js";
import prisma from "../lib/prisma.js";

/** GET /api/vehicles — list all vehicles */
export async function listVehicles(_req: Request, res: Response): Promise<void> {
	const vehicles = await prisma.vehicle.findMany({
		orderBy: { name: "asc" },
	});
	res.json(vehicles);
}

/** GET /api/vehicles/:id — get a single vehicle */
export async function getVehicle(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);

	if (Number.isNaN(id)) {
		res.status(400).json({ error: "Invalid vehicle ID" });
		return;
	}

	const vehicle = await prisma.vehicle.findUnique({ where: { id } });

	if (!vehicle) {
		res.status(404).json({ error: "Vehicle not found" });
		return;
	}

	res.json(vehicle);
}

/** POST /api/vehicles — create a vehicle (validates name uniqueness) */
export async function createVehicle(req: Request, res: Response): Promise<void> {
	const parsed = createVehicleSchema.safeParse(req.body);

	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	try {
		const vehicle = await prisma.vehicle.create({ data: parsed.data });
		res.status(201).json(vehicle);
	} catch (err: unknown) {
		// Prisma unique constraint violation
		if (isPrismaUniqueConstraintError(err)) {
			res.status(409).json({ error: "A vehicle with this name already exists" });
			return;
		}
		throw err;
	}
}

/** PUT /api/vehicles/:id — update a vehicle */
export async function updateVehicle(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);

	if (Number.isNaN(id)) {
		res.status(400).json({ error: "Invalid vehicle ID" });
		return;
	}

	const parsed = updateVehicleSchema.safeParse(req.body);

	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	try {
		const vehicle = await prisma.vehicle.update({
			where: { id },
			data: parsed.data,
		});
		res.json(vehicle);
	} catch (err: unknown) {
		if (isPrismaRecordNotFoundError(err)) {
			res.status(404).json({ error: "Vehicle not found" });
			return;
		}
		if (isPrismaUniqueConstraintError(err)) {
			res.status(409).json({ error: "A vehicle with this name already exists" });
			return;
		}
		throw err;
	}
}

/** DELETE /api/vehicles/:id — delete a vehicle and its refuelings */
export async function deleteVehicle(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);

	if (Number.isNaN(id)) {
		res.status(400).json({ error: "Invalid vehicle ID" });
		return;
	}

	try {
		await prisma.vehicle.delete({ where: { id } });
		res.status(204).send();
	} catch (err: unknown) {
		if (isPrismaRecordNotFoundError(err)) {
			res.status(404).json({ error: "Vehicle not found" });
			return;
		}
		throw err;
	}
}

/** GET /api/vehicles/:id/refuelings — list refuelings for a vehicle ordered by date ASC */
export async function listVehicleRefuelings(req: Request, res: Response): Promise<void> {
	const vehicleId = Number(req.params.id);

	if (Number.isNaN(vehicleId)) {
		res.status(400).json({ error: "Invalid vehicle ID" });
		return;
	}

	const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });

	if (!vehicle) {
		res.status(404).json({ error: "Vehicle not found" });
		return;
	}

	const refuelings = await prisma.refueling.findMany({
		where: { vehicleId },
		orderBy: { date: "asc" },
	});

	res.json(refuelings);
}

/** POST /api/vehicles/:id/refuelings — create a refueling for a vehicle */
export async function createVehicleRefueling(req: Request, res: Response): Promise<void> {
	const vehicleId = Number(req.params.id);

	if (Number.isNaN(vehicleId)) {
		res.status(400).json({ error: "Invalid vehicle ID" });
		return;
	}

	const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });

	if (!vehicle) {
		res.status(404).json({ error: "Vehicle not found" });
		return;
	}

	const parsed = createRefuelingSchema.safeParse(req.body);

	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	const refueling = await prisma.refueling.create({
		data: {
			vehicleId,
			date: new Date(parsed.data.date),
			liters: parsed.data.liters,
			totalPrice: parsed.data.totalPrice,
			mileage: parsed.data.mileage,
			station: parsed.data.station ?? "",
		},
	});

	res.status(201).json(refueling);
}

// --- Prisma error helpers ---

function isPrismaUniqueConstraintError(err: unknown): boolean {
	return (
		typeof err === "object" &&
		err !== null &&
		"code" in err &&
		(err as { code: string }).code === "P2002"
	);
}

function isPrismaRecordNotFoundError(err: unknown): boolean {
	return (
		typeof err === "object" &&
		err !== null &&
		"code" in err &&
		(err as { code: string }).code === "P2025"
	);
}

