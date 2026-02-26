import type { CreateVehicle } from "@shared/schemas/vehicle.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVehicle } from "../api/vehicles";
import VehicleForm from "../components/VehicleForm";

export default function VehicleNewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(data: CreateVehicle) {
    setLoading(true);
    setError(undefined);
    try {
      const vehicle = await createVehicle(data);
      navigate(`/vehicles/${vehicle.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vehicle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Vehicle</h1>
      <VehicleForm onSubmit={handleSubmit} error={error} loading={loading} />
    </div>
  );
}

