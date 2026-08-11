import type { CreateReminder, Reminder } from "@shared/schemas/reminder.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchVehicleReminders, updateReminder } from "../api/reminders";
import { fetchVehicle } from "../api/vehicles";
import ReminderForm from "../components/ReminderForm";

export default function ReminderEditPage() {
  const { id, reminderId } = useParams<{ id: string; reminderId: string }>();
  const vehicleId = Number(id);
  const reminderIdNum = Number(reminderId);
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (Number.isNaN(vehicleId) || Number.isNaN(reminderIdNum)) {
      setError("Invalid ID");
      setLoadingData(false);
      return;
    }

    Promise.all([fetchVehicle(vehicleId), fetchVehicleReminders(vehicleId)] as const)
      .then(([v, reminderList]) => {
        setVehicle(v);
        const found = reminderList.find((r) => r.id === reminderIdNum);
        if (!found) {
          setError("Reminder not found");
        } else {
          setReminder(found);
        }
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoadingData(false));
  }, [vehicleId, reminderIdNum]);

  async function handleSubmit(data: CreateReminder) {
    setLoading(true);
    setError(undefined);
    try {
      await updateReminder(reminderIdNum, data);
      navigate(`/vehicles/${vehicleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update reminder");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) return <p className="text-gray-500">Loading...</p>;
  if (error && !reminder) return <p className="text-red-500">{error}</p>;

  // Convert reminder date from ISO to YYYY-MM-DD for the date input
  const dateValue = reminder ? new Date(reminder.date).toISOString().split("T")[0] : "";

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
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Edit Reminder</h1>
        {vehicle && (
          <p className="text-sm text-gray-500">
            {vehicle.brand} {vehicle.model} · {vehicle.licensePlate}
          </p>
        )}
      </div>
      {reminder && (
        <ReminderForm
          onSubmit={handleSubmit}
          defaultValues={{
            date: dateValue,
            description: reminder.description,
            type: reminder.type,
            mileage: reminder.mileage,
            enabled: reminder.enabled,
          }}
          error={error}
          loading={loading}
        />
      )}
    </div>
  );
}
