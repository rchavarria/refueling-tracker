import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
	// Clean tables in correct FK order: Refueling first, then Vehicle
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
	console.log(`Seed completed: ${vehicleCount} vehicles, ${refuelingCount} refuelings created.`);
}

main()
	.catch((e) => {
		console.error("Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

