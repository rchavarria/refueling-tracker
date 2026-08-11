import { createReminderSchema, updateReminderSchema } from "@shared/schemas/reminder.js";
import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { enrichVehicleWithMileage } from "../lib/vehicles.js";

/** GET /api/vehicles/:id/reminders — list all reminders for a vehicle */
export async function listVehicleReminders(req: Request, res: Response): Promise<void> {
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

	const reminders = await prisma.reminder.findMany({
		where: { vehicleId },
		orderBy: { date: "asc" },
	});

	res.json(reminders);
}

/** POST /api/vehicles/:id/reminders — create a reminder for a vehicle */
export async function createVehicleReminder(req: Request, res: Response): Promise<void> {
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

	const parsed = createReminderSchema.safeParse(req.body);

	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	const reminder = await prisma.reminder.create({
		data: {
			vehicleId,
			date: new Date(parsed.data.date),
			description: parsed.data.description,
			type: parsed.data.type,
			mileage: parsed.data.mileage,
			enabled: parsed.data.enabled,
		},
	});

	res.status(201).json(reminder);
}

/**
 * GET /api/reminders/upcoming — all enabled reminders, including overdue ones.
 *
 * No date filter is applied on purpose: users must not lose track of any reminder.
 * Hiding one is an explicit user action — disable it, or edit it with a new
 * date/mileage.
 */
export async function getUpcomingReminders(_req: Request, res: Response): Promise<void> {
	const reminders = await prisma.reminder.findMany({
		where: {
			enabled: true,
		},
		orderBy: { date: "asc" },
		include: { vehicle: true },
	});

	const enriched = await Promise.all(
		reminders.map(async (reminder) => ({
			...reminder,
			vehicle: await enrichVehicleWithMileage(reminder.vehicle),
		})),
	);

	res.json(enriched);
}

/** PUT /api/reminders/:id — update a reminder */
export async function updateReminder(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);

	if (Number.isNaN(id)) {
		res.status(400).json({ error: "Invalid reminder ID" });
		return;
	}

	const parsed = updateReminderSchema.safeParse(req.body);

	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	const data: Record<string, unknown> = { ...parsed.data };
	if (parsed.data.date !== undefined) {
		data.date = new Date(parsed.data.date);
	}

	try {
		const reminder = await prisma.reminder.update({
			where: { id },
			data,
		});
		res.json(reminder);
	} catch (err: unknown) {
		if (isPrismaRecordNotFoundError(err)) {
			res.status(404).json({ error: "Reminder not found" });
			return;
		}
		throw err;
	}
}

/** DELETE /api/reminders/:id — delete a reminder */
export async function deleteReminder(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);

	if (Number.isNaN(id)) {
		res.status(400).json({ error: "Invalid reminder ID" });
		return;
	}

	try {
		await prisma.reminder.delete({ where: { id } });
		res.status(204).send();
	} catch (err: unknown) {
		if (isPrismaRecordNotFoundError(err)) {
			res.status(404).json({ error: "Reminder not found" });
			return;
		}
		throw err;
	}
}

// --- Prisma error helpers ---

function isPrismaRecordNotFoundError(err: unknown): boolean {
	return (
		typeof err === "object" &&
		err !== null &&
		"code" in err &&
		(err as { code: string }).code === "P2025"
	);
}