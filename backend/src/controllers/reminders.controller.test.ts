import type { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------

const mockReminderFindMany = vi.fn();
const mockRefuelingAggregate = vi.fn();

vi.mock("../lib/prisma.js", () => ({
	default: {
		reminder: { findMany: (...args: unknown[]) => mockReminderFindMany(...args) },
		refueling: { aggregate: (...args: unknown[]) => mockRefuelingAggregate(...args) },
	},
}));

import { getUpcomingReminders } from "./reminders.controller.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const vehicle = { id: 1, name: "Toyota", plate: "1234ABC" };

/** Creates a reminder record joined with its vehicle, as returned by Prisma */
function reminder(id: number, date: string) {
	return {
		id,
		vehicleId: vehicle.id,
		date: new Date(date),
		description: "Maintenance",
		type: "maintenance",
		mileage: null,
		enabled: true,
		vehicle,
	};
}

/** Minimal Express response double capturing the JSON payload */
function mockResponse() {
	return { json: vi.fn() } as unknown as Response;
}

/** Fix "now" to 2026-08-11 for deterministic tests */
beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date("2026-08-11"));
	mockReminderFindMany.mockReset();
	mockRefuelingAggregate.mockReset();
	mockRefuelingAggregate.mockResolvedValue({ _max: { mileage: 120_000 } });
});

afterEach(() => {
	vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getUpcomingReminders", () => {
	it("queries enabled reminders without any date filter", async () => {
		mockReminderFindMany.mockResolvedValue([]);
		const res = mockResponse();

		await getUpcomingReminders({} as Request, res);

		expect(mockReminderFindMany).toHaveBeenCalledWith({
			where: { enabled: true },
			orderBy: { date: "asc" },
			include: { vehicle: true },
		});
	});

	it("returns long overdue, recently overdue and future reminders", async () => {
		const longOverdue = reminder(1, "2026-05-01"); // more than 3 months ago
		const recentlyOverdue = reminder(2, "2026-08-08"); // 3 days ago
		const future = reminder(3, "2026-09-30");
		mockReminderFindMany.mockResolvedValue([longOverdue, recentlyOverdue, future]);
		const res = mockResponse();

		await getUpcomingReminders({} as Request, res);

		const payload = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(payload.map((r: { id: number }) => r.id)).toEqual([1, 2, 3]);
	});

	it("enriches each vehicle with its current mileage", async () => {
		mockReminderFindMany.mockResolvedValue([reminder(1, "2026-05-01")]);
		const res = mockResponse();

		await getUpcomingReminders({} as Request, res);

		const payload = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(payload[0].vehicle).toEqual({ ...vehicle, currentMileage: 120_000 });
	});
});
