import type { Request, Response } from "express";
import { updateRefuelingSchema } from "@shared/schemas/refueling.js";
import prisma from "../lib/prisma.js";

/** GET /api/refuelings — list all refuelings */
export async function listRefuelings(_req: Request, res: Response): Promise<void> {
	const refuelings = await prisma.refueling.findMany({
		orderBy: { date: "asc" },
		include: { vehicle: true },
	});
	res.json(refuelings);
}

/** GET /api/refuelings/:id — get a single refueling */
export async function getRefueling(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);

	if (Number.isNaN(id)) {
		res.status(400).json({ error: "Invalid refueling ID" });
		return;
	}

	const refueling = await prisma.refueling.findUnique({
		where: { id },
		include: { vehicle: true },
	});

	if (!refueling) {
		res.status(404).json({ error: "Refueling not found" });
		return;
	}

	res.json(refueling);
}

/** PUT /api/refuelings/:id — update a refueling */
export async function updateRefueling(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);

	if (Number.isNaN(id)) {
		res.status(400).json({ error: "Invalid refueling ID" });
		return;
	}

	const parsed = updateRefuelingSchema.safeParse(req.body);

	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	// Build data object, normalizing station to "" if provided as undefined
	const data: Record<string, unknown> = { ...parsed.data };
	if (parsed.data.date !== undefined) {
		data.date = new Date(parsed.data.date);
	}
	if (parsed.data.station !== undefined) {
		data.station = parsed.data.station;
	}

	try {
		const refueling = await prisma.refueling.update({
			where: { id },
			data,
		});
		res.json(refueling);
	} catch (err: unknown) {
		if (isPrismaRecordNotFoundError(err)) {
			res.status(404).json({ error: "Refueling not found" });
			return;
		}
		throw err;
	}
}

/** DELETE /api/refuelings/:id — delete a refueling */
export async function deleteRefueling(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);

	if (Number.isNaN(id)) {
		res.status(400).json({ error: "Invalid refueling ID" });
		return;
	}

	try {
		await prisma.refueling.delete({ where: { id } });
		res.status(204).send();
	} catch (err: unknown) {
		if (isPrismaRecordNotFoundError(err)) {
			res.status(404).json({ error: "Refueling not found" });
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

