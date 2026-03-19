import "dotenv/config";
import {env} from "prisma/config";
import prisma from "../lib/prisma";

async function main() {
	const database = env("DATABASE_URL");
	if (database && database.indexOf("prod") >= 0) {
		console.error("Refusing to seed production database:", database);
		process.exit(1);
	}

	// Clean tables in correct FK order: dependent tables first, then Vehicle
	await prisma.maintenance.deleteMany();
	await prisma.reminder.deleteMany();
	await prisma.refueling.deleteMany();
	await prisma.vehicle.deleteMany();

	// Create vehicles
	const familySuv = await prisma.vehicle.create({
		data: {
			name: "Family SUV",
			brand: "Toyota",
			model: "RAV4",
			licensePlate: "1234 ABC",
			year: 2023,
		},
	});

	const cityCommuter = await prisma.vehicle.create({
		data: {
			name: "City Commuter",
			brand: "Volkswagen",
			model: "Golf",
			licensePlate: "5678 DEF",
			year: 2024,
		},
	});

	const weekendRoadster = await prisma.vehicle.create({
		data: {
			name: "Weekend Roadster",
			brand: "Mazda",
			model: "MX-5",
			licensePlate: "9012 GHI",
			year: 2022,
		},
	});

	// Refuelings for Family SUV (7 entries, starting at 12000 km)
	const suvRefuelings = [
		{ date: "2026-01-05", liters: 45.2, pricePerLiter: 1.62, mileage: 12000, station: "Repsol A-6 km 12" },
		{ date: "2026-01-12", liters: 42.8, pricePerLiter: 1.58, mileage: 12450, station: "Cepsa Gran Vía" },
		{ date: "2026-01-20", liters: 50.1, pricePerLiter: 1.65, mileage: 13050, station: "BP Alcobendas" },
		{ date: "2026-01-28", liters: 38.5, pricePerLiter: 1.70, mileage: 13400, station: "Repsol A-6 km 12" },
		{ date: "2026-02-04", liters: 47.3, pricePerLiter: 1.55, mileage: 14100, station: "Shell M-40 Sur" },
		{ date: "2026-02-11", liters: 44.0, pricePerLiter: 1.72, mileage: 14600, station: "Cepsa Gran Vía" },
		{ date: "2026-02-18", liters: 51.5, pricePerLiter: 1.68, mileage: 15350, station: "BP Alcobendas" },
	];

	// Refuelings for City Commuter (6 entries, starting at 5200 km)
	const cityRefuelings = [
		{ date: "2026-01-03", liters: 32.0, pricePerLiter: 1.60, mileage: 5200, station: "Repsol Centro" },
		{ date: "2026-01-14", liters: 28.5, pricePerLiter: 1.63, mileage: 5530, station: "Cepsa Arturo Soria" },
		{ date: "2026-01-25", liters: 35.2, pricePerLiter: 1.57, mileage: 6100, station: "Shell Castellana" },
		{ date: "2026-02-03", liters: 30.0, pricePerLiter: 1.75, mileage: 6480, station: "BP Chamartín" },
		{ date: "2026-02-12", liters: 33.8, pricePerLiter: 1.68, mileage: 7050, station: "Repsol Centro" },
		{ date: "2026-02-19", liters: 29.5, pricePerLiter: 1.80, mileage: 7400, station: "Cepsa Arturo Soria" },
	];

	// Refuelings for Weekend Roadster (5 entries, starting at 8500 km)
	const roadsterRefuelings = [
		{ date: "2026-01-10", liters: 35.0, pricePerLiter: 1.72, mileage: 8500, station: "Repsol Sierra Norte" },
		{ date: "2026-01-24", liters: 40.2, pricePerLiter: 1.65, mileage: 9200, station: "BP Navacerrada" },
		{ date: "2026-02-01", liters: 38.0, pricePerLiter: 1.78, mileage: 9750, station: "Shell Segovia" },
		{ date: "2026-02-10", liters: 42.5, pricePerLiter: 1.60, mileage: 10500, station: "Cepsa Ávila" },
		{ date: "2026-02-17", liters: 36.8, pricePerLiter: 1.70, mileage: 11100, station: "Repsol Sierra Norte" },
	];

	const allRefuelings = [
		...suvRefuelings.map((r) => ({ ...r, vehicleId: familySuv.id })),
		...cityRefuelings.map((r) => ({ ...r, vehicleId: cityCommuter.id })),
		...roadsterRefuelings.map((r) => ({ ...r, vehicleId: weekendRoadster.id })),
	];

	for (const r of allRefuelings) {
		await prisma.refueling.create({
			data: {
				vehicleId: r.vehicleId,
				date: new Date(r.date),
				liters: r.liters,
				totalPrice: Math.round(r.liters * r.pricePerLiter * 100) / 100,
				mileage: r.mileage,
				station: r.station,
			},
		});
	}

	const vehicleCount = await prisma.vehicle.count();
	const refuelingCount = await prisma.refueling.count();

	// Seed reminders
	// Helper: date offset from today
	function daysFromNow(days: number): Date {
		const d = new Date();
		d.setDate(d.getDate() + days);
		return d;
	}

	// Last mileages per vehicle (used to set reminder mileage relative to vehicle mileage)
	// Family SUV last mileage: 15350, City Commuter: 7400, Weekend Roadster: 11100
	const reminderData = [
		// --- Family SUV ---
		// RED by date: due in 3 days (≤7 days)
		{ vehicleId: familySuv.id, date: daysFromNow(3),  description: "Oil change - urgent (red: due in 3 days)",      type: "maintenance", mileage: 20000, enabled: true },
		// ORANGE by km: 2000 km left (1000-3000 km away), date far away
		{ vehicleId: familySuv.id, date: daysFromNow(60), description: "Tire rotation (orange: 2000 km away)",          type: "maintenance", mileage: 17350, enabled: true },
		// RED overdue: due 5 days ago
		{ vehicleId: familySuv.id, date: daysFromNow(-5), description: "Brake fluid check - overdue (red: 5 days ago)", type: "maintenance", mileage: 20000, enabled: true },

		// --- City Commuter ---
		// GREEN by date: due in 45 days (>30 days)
		{ vehicleId: cityCommuter.id, date: daysFromNow(45), description: "Annual registration renewal (green: 45 days away)", type: "registration", mileage: 15000, enabled: true },
		// ORANGE by date: due in 15 days (7-30 days)
		{ vehicleId: cityCommuter.id, date: daysFromNow(15), description: "Brake pads inspection (orange: 15 days away)",      type: "inspection",  mileage: 15000, enabled: true },

		// --- Weekend Roadster ---
		// RED by km: 500 km left (<1000 km away), date far away
		{ vehicleId: weekendRoadster.id, date: daysFromNow(60), description: "Tire inspection - urgent (red: 500 km away)",          type: "inspection",  mileage: 11600, enabled: true },
		// GREEN by date and km: 45 days away and 5000 km away
		{ vehicleId: weekendRoadster.id, date: daysFromNow(45), description: "Insurance renewal (green: 45 days and 5000 km away)", type: "insurance",   mileage: 16100, enabled: true },
	];

	for (const r of reminderData) {
		await prisma.reminder.create({
			data: {
				vehicleId: r.vehicleId,
				date: new Date(r.date),
				description: r.description,
				type: r.type,
				mileage: r.mileage,
				enabled: r.enabled,
			},
		});
	}

	const reminderCount = await prisma.reminder.count();

	// Seed maintenances
	const maintenanceData = [
		// --- Family SUV (3 maintenances) ---
		{ vehicleId: familySuv.id, date: "2025-09-15", type: "Oil",     description: "Full synthetic oil change at 10000 km",   mileage: 10000, cost: 89.50 },
		{ vehicleId: familySuv.id, date: "2025-11-20", type: "ITV",     description: "Annual ITV inspection passed",            mileage: 11200, cost: 45.00 },
		{ vehicleId: familySuv.id, date: "2026-01-10", type: "Wheels",  description: "Winter tyre rotation and balancing",      mileage: 12200, cost: 60.00 },

		// --- City Commuter (4 maintenances) ---
		{ vehicleId: cityCommuter.id, date: "2025-08-05", type: "Oil",     description: "First oil change at 3000 km",             mileage: 3000, cost: 75.00 },
		{ vehicleId: cityCommuter.id, date: "2025-10-12", type: "Brakes",  description: "Front brake pads replacement",            mileage: 4200, cost: 180.00 },
		{ vehicleId: cityCommuter.id, date: "2025-12-01", type: "Lights",  description: "Left headlight bulb replacement",         mileage: 5000, cost: 25.00 },
		{ vehicleId: cityCommuter.id, date: "2026-02-08", type: "ITV",     description: "Annual ITV inspection passed with notes", mileage: 6600, cost: 45.00 },

		// --- Weekend Roadster (5 maintenances) ---
		{ vehicleId: weekendRoadster.id, date: "2025-06-10", type: "Oil",     description: "Synthetic oil and filter change",         mileage: 7000, cost: 95.00 },
		{ vehicleId: weekendRoadster.id, date: "2025-08-22", type: "Wheels",  description: "New summer tyres installed (4 units)",    mileage: 7800, cost: 420.00 },
		{ vehicleId: weekendRoadster.id, date: "2025-10-05", type: "Brakes",  description: "Rear brake discs and pads replacement",  mileage: 8300, cost: 310.00 },
		{ vehicleId: weekendRoadster.id, date: "2025-12-18", type: "AdBlue",  description: "AdBlue tank refill (10L)",               mileage: 9500, cost: 15.00 },
		{ vehicleId: weekendRoadster.id, date: "2026-02-14", type: "Repair",  description: "Exhaust pipe bracket weld repair",       mileage: 10800, cost: 135.00 },
	];

	for (const m of maintenanceData) {
		await prisma.maintenance.create({
			data: {
				vehicleId: m.vehicleId,
				date: new Date(m.date),
				type: m.type,
				description: m.description,
				mileage: m.mileage,
				cost: m.cost,
			},
		});
	}

	const maintenanceCount = await prisma.maintenance.count();
	console.log(`Seed completed: ${vehicleCount} vehicles, ${refuelingCount} refuelings, ${reminderCount} reminders, ${maintenanceCount} maintenances created.`);
}

main()
	.catch((e) => {
		console.error("Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

