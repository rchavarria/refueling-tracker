import type { CreateMaintenance, Maintenance } from "@shared/schemas/maintenance.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchVehicleMaintenances, updateMaintenance } from "../api/maintenances";
import { fetchVehicle } from "../api/vehicles";
import MaintenanceForm from "../components/MaintenanceForm";

export default function MaintenanceEditPage() {
  const { id, maintenanceId } = useParams<{ id: string; maintenanceId: string }>();
  const vehicleId = Number(id);
  const maintenanceIdNum = Number(maintenanceId);
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (Number.isNaN(vehicleId) || Number.isNaN(maintenanceIdNum)) {
      setError("Invalid ID");
      setLoadingData(false);
      return;
    }

    Promise.all([fetchVehicle(vehicleId), fetchVehicleMaintenances(vehicleId)])
      .then(([v, maintenanceList]: [Vehicle, Maintenance[]]) => {
        setVehicle(v);
        const found = maintenanceList.find((m) => m.id === maintenanceIdNum);
        if (!found) {
          setError("Maintenance not found");
        } else {
          setMaintenance(found);
        }
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoadingData(false));
  }, [vehicleId, maintenanceIdNum]);

  async function handleSubmit(data: CreateMaintenance) {
    setLoading(true);
    setError(undefined);
    try {
      await updateMaintenance(maintenanceIdNum, data);
      navigate(`/vehicles/${vehicleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update maintenance");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) return <p className="text-gray-500">Loading...</p>;
  if (error && !maintenance) return <p className="text-red-500">{error}</p>;

  // Convert maintenance date from ISO to YYYY-MM-DD for the date input
  const dateValue = maintenance ? new Date(maintenance.date).toISOString().split("T")[0] : "";

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
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Edit Maintenance</h1>
        {vehicle && (
          <p className="text-sm text-gray-500">
            {vehicle.brand} {vehicle.model} · {vehicle.licensePlate}
          </p>
        )}
      </div>
      {maintenance && (
        <MaintenanceForm
          onSubmit={handleSubmit}
          defaultValues={{
            type: maintenance.type,
            date: dateValue,
            description: maintenance.description,
            mileage: maintenance.mileage,
            cost: maintenance.cost,
          }}
          error={error}
          loading={loading}
        />
      )}
    </div>
  );
}
