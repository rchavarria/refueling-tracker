import type { Reminder } from "@shared/schemas/reminder.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { useEffect, useState } from "react";
import { fetchUpcomingReminders } from "../api/reminders";
import { getReminderColor, REMINDER_ROW_CLASSES, REMINDER_BADGE_CLASSES } from "../utils/reminderColor";
import ReminderColorTooltip from "./ReminderColorTooltip";
import ReminderRowTooltip from "./ReminderRowTooltip";


function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

export default function UpcomingReminders() {
  const [upcomingReminders, setUpcomingReminders] = useState<(Reminder & { vehicle: Vehicle })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingReminders()
      .then(setUpcomingReminders)
      .catch(() => setError("Failed to load upcoming reminders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        Upcoming Reminders
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : upcomingReminders.length === 0 ? (
        <p className="text-gray-400 py-4 text-center">No upcoming reminders.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-2">Vehicle</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-right">Mileage</th>
              </tr>
            </thead>
            <tbody>
              {upcomingReminders.map((r) => {
                const color = getReminderColor(r, r.vehicle.currentMileage);
                return (
                  <tr
                    key={r.id}
                    className={`border-t border-gray-100 hover:brightness-95 ${REMINDER_ROW_CLASSES[color]}`}
                  >
                    <ReminderRowTooltip reminder={r} color={color}>
                      <a href={`/vehicles/${r.vehicleId}`} className="text-blue-600 hover:underline">
                        {r.vehicle.name}
                      </a>
                    </ReminderRowTooltip>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={REMINDER_BADGE_CLASSES[color]} aria-hidden="true" />
                      {formatDate(r.date)}
                    </td>
                    <td className="px-4 py-2 text-right">{r.mileage.toLocaleString()} km</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ReminderColorTooltip />

    </section>
  );
}

