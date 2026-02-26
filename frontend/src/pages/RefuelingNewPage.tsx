import type { CreateRefueling } from "@shared/schemas/refueling.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createRefueling } from "../api/refuelings";
import { fetchVehicle } from "../api/vehicles";
import RefuelingForm from "../components/RefuelingForm";

export default function RefuelingNewPage() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id);
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!Number.isNaN(vehicleId)) {
      fetchVehicle(vehicleId).then(setVehicle).catch(() => setError("Vehicle not found"));
    }
  }, [vehicleId]);

  async function handleSubmit(data: CreateRefueling) {
    setLoading(true);
    setError(undefined);
    try {
      await createRefueling(vehicleId, data);
      navigate(`/vehicles/${vehicleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save refueling");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <a
          href={`/vehicles/${vehicleId}`}
          className="text-sm text-blue-500 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/vehicles/${vehicleId}`);
          }}
        >
          ← {vehicle ? vehicle.name : "Back"}
        </a>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Add Refueling</h1>
        {vehicle && (
          <p className="text-sm text-gray-500">
            {vehicle.brand} {vehicle.model} · {vehicle.licensePlate}
          </p>
        )}
      </div>
      <RefuelingForm onSubmit={handleSubmit} error={error} loading={loading} />
    </div>
  );
}

