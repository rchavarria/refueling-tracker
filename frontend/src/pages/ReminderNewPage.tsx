import type { CreateReminder } from "@shared/schemas/reminder.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReminder } from "../api/reminders";
import { fetchVehicle } from "../api/vehicles";
import ReminderForm from "../components/ReminderForm";

export default function ReminderNewPage() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id);
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!Number.isNaN(vehicleId)) {
      fetchVehicle(vehicleId)
        .then(setVehicle)
        .catch(() => setError("Vehicle not found"));
    }
  }, [vehicleId]);

  async function handleSubmit(data: CreateReminder) {
    setLoading(true);
    setError(undefined);
    try {
      await createReminder(vehicleId, data);
      navigate(`/vehicles/${vehicleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save reminder");
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
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Add Reminder</h1>
        {vehicle && (
          <p className="text-sm text-gray-500">
            {vehicle.brand} {vehicle.model} · {vehicle.licensePlate}
          </p>
        )}
      </div>
      <ReminderForm onSubmit={handleSubmit} error={error} loading={loading} />
    </div>
  );
}
