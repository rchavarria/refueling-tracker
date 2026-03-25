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

	// Refuelings for Family SUV (20 entries, starting at 12000 km, spread over ~12 months)
	const suvRefuelings = [
		{ date: daysFromNow(-365), liters: 45.2, pricePerLiter: 1.62, mileage: 12000, station: "Repsol A-6 km 12" },
		{ date: daysFromNow(-345), liters: 42.8, pricePerLiter: 1.58, mileage: 12400, station: "Cepsa Gran Vía" },
		{ date: daysFromNow(-322), liters: 50.1, pricePerLiter: 1.65, mileage: 12900, station: "BP Alcobendas" },
		{ date: daysFromNow(-300), liters: 38.5, pricePerLiter: 1.70, mileage: 13350, station: "Shell M-40 Sur" },
		{ date: daysFromNow(-278), liters: 47.3, pricePerLiter: 1.55, mileage: 13800, station: "Repsol A-6 km 12" },
		{ date: daysFromNow(-260), liters: 44.0, pricePerLiter: 1.72, mileage: 14200, station: "Cepsa Gran Vía" },
		{ date: daysFromNow(-238), liters: 51.5, pricePerLiter: 1.68, mileage: 14750, station: "BP Alcobendas" },
		{ date: daysFromNow(-220), liters: 40.3, pricePerLiter: 1.60, mileage: 15100, station: "Repsol A-6 km 12" },
		{ date: daysFromNow(-198), liters: 46.7, pricePerLiter: 1.74, mileage: 15600, station: "Shell M-40 Sur" },
		{ date: daysFromNow(-175), liters: 43.1, pricePerLiter: 1.66, mileage: 16050, station: "Cepsa Gran Vía" },
		{ date: daysFromNow(-158), liters: 49.8, pricePerLiter: 1.59, mileage: 16500, station: "BP Alcobendas" },
		{ date: daysFromNow(-140), liters: 37.9, pricePerLiter: 1.71, mileage: 16950, station: "Repsol A-6 km 12" },
		{ date: daysFromNow(-118), liters: 52.0, pricePerLiter: 1.63, mileage: 17500, station: "Shell M-40 Sur" },
		{ date: daysFromNow(-100), liters: 41.5, pricePerLiter: 1.76, mileage: 17900, station: "Cepsa Gran Vía" },
		{ date: daysFromNow(-82),  liters: 48.2, pricePerLiter: 1.54, mileage: 18400, station: "BP Alcobendas" },
		{ date: daysFromNow(-65),  liters: 39.6, pricePerLiter: 1.69, mileage: 18850, station: "Repsol A-6 km 12" },
		{ date: daysFromNow(-48),  liters: 44.8, pricePerLiter: 1.73, mileage: 19350, station: "Shell M-40 Sur" },
		{ date: daysFromNow(-30),  liters: 50.5, pricePerLiter: 1.61, mileage: 19800, station: "Cepsa Gran Vía" },
		{ date: daysFromNow(-15),  liters: 42.3, pricePerLiter: 1.67, mileage: 20300, station: "BP Alcobendas" },
		{ date: daysFromNow(-3),   liters: 46.0, pricePerLiter: 1.70, mileage: 20750, station: "Repsol A-6 km 12" },
	];

	// Refuelings for City Commuter (15 entries, starting at 5200 km, spread over ~10 months)
	const cityRefuelings = [
		{ date: daysFromNow(-300), liters: 32.0, pricePerLiter: 1.60, mileage: 5200, station: "Repsol Centro" },
		{ date: daysFromNow(-280), liters: 28.5, pricePerLiter: 1.63, mileage: 5450, station: "Cepsa Arturo Soria" },
		{ date: daysFromNow(-258), liters: 35.2, pricePerLiter: 1.57, mileage: 5700, station: "Shell Castellana" },
		{ date: daysFromNow(-240), liters: 30.0, pricePerLiter: 1.75, mileage: 5950, station: "BP Chamartín" },
		{ date: daysFromNow(-218), liters: 33.8, pricePerLiter: 1.68, mileage: 6200, station: "Repsol Centro" },
		{ date: daysFromNow(-200), liters: 29.5, pricePerLiter: 1.80, mileage: 6450, station: "Cepsa Arturo Soria" },
		{ date: daysFromNow(-178), liters: 31.2, pricePerLiter: 1.62, mileage: 6700, station: "Shell Castellana" },
		{ date: daysFromNow(-155), liters: 34.6, pricePerLiter: 1.71, mileage: 6950, station: "BP Chamartín" },
		{ date: daysFromNow(-138), liters: 27.8, pricePerLiter: 1.66, mileage: 7150, station: "Repsol Centro" },
		{ date: daysFromNow(-115), liters: 36.0, pricePerLiter: 1.58, mileage: 7400, station: "Cepsa Arturo Soria" },
		{ date: daysFromNow(-95),  liters: 30.5, pricePerLiter: 1.74, mileage: 7650, station: "Shell Castellana" },
		{ date: daysFromNow(-72),  liters: 33.1, pricePerLiter: 1.64, mileage: 7900, station: "BP Chamartín" },
		{ date: daysFromNow(-50),  liters: 28.9, pricePerLiter: 1.77, mileage: 8150, station: "Repsol Centro" },
		{ date: daysFromNow(-25),  liters: 35.4, pricePerLiter: 1.61, mileage: 8400, station: "Cepsa Arturo Soria" },
		{ date: daysFromNow(-5),   liters: 31.7, pricePerLiter: 1.69, mileage: 8650, station: "Shell Castellana" },
	];

	// Refuelings for Weekend Roadster (10 entries, starting at 8500 km, spread over ~6 months)
	const roadsterRefuelings = [
		{ date: daysFromNow(-180), liters: 35.0, pricePerLiter: 1.72, mileage: 8500,  station: "Repsol Sierra Norte" },
		{ date: daysFromNow(-158), liters: 40.2, pricePerLiter: 1.65, mileage: 8850,  station: "BP Navacerrada" },
		{ date: daysFromNow(-138), liters: 38.0, pricePerLiter: 1.78, mileage: 9200,  station: "Shell Segovia" },
		{ date: daysFromNow(-118), liters: 42.5, pricePerLiter: 1.60, mileage: 9600,  station: "Cepsa Ávila" },
		{ date: daysFromNow(-98),  liters: 36.8, pricePerLiter: 1.70, mileage: 9950,  station: "Repsol Sierra Norte" },
		{ date: daysFromNow(-78),  liters: 39.3, pricePerLiter: 1.67, mileage: 10300, station: "BP Navacerrada" },
		{ date: daysFromNow(-60),  liters: 41.0, pricePerLiter: 1.74, mileage: 10700, station: "Shell Segovia" },
		{ date: daysFromNow(-40),  liters: 37.5, pricePerLiter: 1.63, mileage: 11050, station: "Cepsa Ávila" },
		{ date: daysFromNow(-20),  liters: 43.2, pricePerLiter: 1.71, mileage: 11450, station: "Repsol Sierra Norte" },
		{ date: daysFromNow(-4),   liters: 36.1, pricePerLiter: 1.68, mileage: 11800, station: "BP Navacerrada" },
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
	// Family SUV last mileage: 20750, City Commuter: 8650, Weekend Roadster: 11800
	const reminderData = [
		// --- Family SUV ---
		// RED by date: due in 3 days (≤7 days)
		{ vehicleId: familySuv.id, date: daysFromNow(3),  description: "Oil change - urgent (red: due in 3 days)",      type: "maintenance", mileage: 30000, enabled: true },
		// ORANGE by km: 2000 km left (1000-3000 km away), date far away
		{ vehicleId: familySuv.id, date: daysFromNow(60), description: "Tire rotation (orange: 2000 km away)",          type: "maintenance", mileage: 22750, enabled: true },
		// RED overdue: due 5 days ago
		{ vehicleId: familySuv.id, date: daysFromNow(-5), description: "Brake fluid check - overdue (red: 5 days ago)", type: "maintenance", mileage: 30000, enabled: true },

		// --- City Commuter ---
		// GREEN by date: due in 45 days (>30 days)
		{ vehicleId: cityCommuter.id, date: daysFromNow(45), description: "Annual registration renewal (green: 45 days away)", type: "registration", mileage: 15000, enabled: true },
		// ORANGE by date: due in 15 days (7-30 days)
		{ vehicleId: cityCommuter.id, date: daysFromNow(15), description: "Brake pads inspection (orange: 15 days away)",      type: "inspection",  mileage: 15000, enabled: true },

		// --- Weekend Roadster ---
		// RED by km: 500 km left (<1000 km away), date far away
		{ vehicleId: weekendRoadster.id, date: daysFromNow(60), description: "Tire inspection - urgent (red: 500 km away)",          type: "inspection",  mileage: 12300, enabled: true },
		// GREEN by date and km: 45 days away and 5000 km away
		{ vehicleId: weekendRoadster.id, date: daysFromNow(45), description: "Insurance renewal (green: 45 days and 5000 km away)", type: "insurance",   mileage: 16800, enabled: true },
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

