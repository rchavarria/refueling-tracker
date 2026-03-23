import type { Refueling } from "@shared/schemas/refueling.js";
import type { Reminder } from "@shared/schemas/reminder.js";
import type { Maintenance } from "@shared/schemas/maintenance.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { calculateConsumption } from "@shared/statistics/index.js";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchVehicleRefuelings } from "../api/refuelings";
import { fetchVehicleReminders } from "../api/reminders";
import { fetchVehicleMaintenances } from "../api/maintenances";
import { fetchVehicle } from "../api/vehicles";
import RefuelingList from "../components/RefuelingList";
import ReminderList from "../components/ReminderList";
import MaintenanceList from "../components/MaintenanceList";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [refuelings, setRefuelings] = useState<Refueling[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(vehicleId)) {
      setError("Invalid vehicle ID");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const v = await fetchVehicle(vehicleId);
        const r = await fetchVehicleRefuelings(vehicleId);
        const rem = await fetchVehicleReminders(vehicleId);
        const maint = await fetchVehicleMaintenances(vehicleId);
        setVehicle(v);
        setRefuelings(r);
        setReminders(rem);
        setMaintenances(maint);
      } catch {
        setError("Failed to load vehicle data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [vehicleId]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!vehicle) return <p className="text-gray-500">Vehicle not found.</p>;

  // Calculate stats with ASC order (required by calculateConsumption),
  // then reverse both arrays for display in DESC order (newest first)
  const statsAsc = calculateConsumption(
    refuelings.map((r) => ({
      mileage: r.mileage,
      liters: r.liters,
      totalPrice: r.totalPrice,
    })),
  );
  const refuelingsDesc = [...refuelings].reverse();
  const statsDesc = [...statsAsc].reverse();

  return (
    <div>
      <div>
        <Link to="/vehicles" className="text-sm text-blue-500 hover:underline">
          ← Vehicles
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 mt-1">{vehicle.name}</h1>
        <p className="text-sm text-gray-500">
          {vehicle.brand} {vehicle.model} · {vehicle.year} · {vehicle.licensePlate}
        </p>
      </div>

      {/* Reminders Section */}
      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Reminders</h2>
        <Link
          to={`/vehicles/${vehicle.id}/reminders/new`}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
        >
          + Add Reminder
        </Link>
      </div>

      <ReminderList reminders={reminders} vehicleId={vehicle.id} />

      {/* Refuelings Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-700">Refuelings</h2>

        <Link
          to={`/vehicles/${vehicle.id}/refuelings/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          + Add Refueling
        </Link>
      </div>

      <RefuelingList refuelings={refuelingsDesc} stats={statsDesc} />

      {/* Maintenances Section */}
      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Maintenances</h2>
        <Link
          to={`/vehicles/${vehicle.id}/maintenances/new`}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
        >
          + Add Maintenance
        </Link>
      </div>

      <MaintenanceList maintenances={maintenances} vehicleId={vehicle.id} />
    </div>
  );
}
