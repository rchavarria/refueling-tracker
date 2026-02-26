import type { Vehicle } from "@shared/schemas/vehicle.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchVehicles } from "../api/vehicles";

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles()
      .then(setVehicles)
      .catch(() => setError("Failed to load vehicles"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading vehicles...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Vehicles</h1>
        <Link
          to="/vehicles/new"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          + Add Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No vehicles yet.</p>
          <Link to="/vehicles/new" className="text-blue-500 hover:underline mt-2 inline-block">
            Add your first vehicle
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <Link
              key={v.id}
              to={`/vehicles/${v.id}`}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition"
            >
              <h2 className="text-lg font-semibold text-gray-800">{v.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {v.brand} {v.model} · {v.year}
              </p>
              <p className="text-xs text-gray-400 mt-1">{v.licensePlate}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

