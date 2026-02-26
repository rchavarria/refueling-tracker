import type { Refueling } from "@shared/schemas/refueling.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { calculateConsumption } from "@shared/statistics/index.js";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchVehicleRefuelings } from "../api/refuelings";
import { fetchVehicle } from "../api/vehicles";
import RefuelingList from "../components/RefuelingList";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [refuelings, setRefuelings] = useState<Refueling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(vehicleId)) {
      setError("Invalid vehicle ID");
      setLoading(false);
      return;
    }

    Promise.all([fetchVehicle(vehicleId), fetchVehicleRefuelings(vehicleId)])
      .then(([v, r]) => {
        setVehicle(v);
        setRefuelings(r);
      })
      .catch(() => setError("Failed to load vehicle data"))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!vehicle) return <p className="text-gray-500">Vehicle not found.</p>;

  const stats = calculateConsumption(
    refuelings.map((r) => ({
      mileage: r.mileage,
      liters: r.liters,
      totalPrice: r.totalPrice,
    })),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/vehicles" className="text-sm text-blue-500 hover:underline">
            ← Vehicles
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{vehicle.name}</h1>
          <p className="text-sm text-gray-500">
            {vehicle.brand} {vehicle.model} · {vehicle.year} · {vehicle.licensePlate}
          </p>
        </div>
        <Link
          to={`/vehicles/${vehicle.id}/refuelings/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          + Add Refueling
        </Link>
      </div>

      <RefuelingList refuelings={refuelings} stats={stats} />
    </div>
  );
}

