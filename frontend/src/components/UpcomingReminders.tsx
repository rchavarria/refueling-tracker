import type { Reminder } from "@shared/schemas/reminder.js";
import { REMINDER_TYPE_LABELS, type ReminderType } from "@shared/schemas/reminder.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { useEffect, useState } from "react";
import { fetchUpcomingReminders } from "../api/reminders";
import ReminderColorTooltip from "./ReminderColorTooltip";

type ReminderColor = "red" | "orange" | "green";

function getReminderColor(reminder: Reminder & { vehicle: Vehicle }): ReminderColor {
  const today = new Date(new Date().toISOString().split("T")[0]);
  const dueDate = new Date(reminder.date);
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let colorByDate: ReminderColor;
  if (diffDays <= 7) colorByDate = "red";
  else if (diffDays <= 30) colorByDate = "orange";
  else colorByDate = "green";

  const currentMileage = reminder.vehicle.currentMileage;
  let colorByKm: ReminderColor | null = null;
  if (currentMileage !== null && reminder.mileage !== null) {
    const kmLeft = reminder.mileage - currentMileage;
    if (kmLeft < 1000) colorByKm = "red";
    else if (kmLeft <= 3000) colorByKm = "orange";
    else colorByKm = "green";
  }

  const priority: ReminderColor[] = ["red", "orange", "green"];
  const colors = [colorByDate, colorByKm].filter((c): c is ReminderColor => c !== null);
  return priority.find((p) => colors.includes(p)) ?? "green";
}

const REMINDER_ROW_CLASSES: Record<ReminderColor, string> = {
  red: "bg-red-50",
  orange: "bg-orange-50",
  green: "bg-green-50",
};

const REMINDER_BADGE_CLASSES: Record<ReminderColor, string> = {
  red: "inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-2",
  orange: "inline-block w-2.5 h-2.5 rounded-full bg-orange-400 mr-2",
  green: "inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2",
};

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
        <ReminderColorTooltip />
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
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 text-right">Mileage</th>
              </tr>
            </thead>
            <tbody>
              {upcomingReminders.map((r) => {
                const color = getReminderColor(r);
                return (
                  <tr
                    key={r.id}
                    className={`border-t border-gray-100 hover:brightness-95 ${REMINDER_ROW_CLASSES[color]}`}
                  >
                    <td className="px-4 py-2 font-medium">
                      <a href={`/vehicles/${r.vehicleId}`} className="text-blue-600 hover:underline">
                        {r.vehicle.name}
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      {REMINDER_TYPE_LABELS[r.type as ReminderType] ?? r.type}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={REMINDER_BADGE_CLASSES[color]} aria-hidden="true" />
                      {formatDate(r.date)}
                    </td>
                    <td className="px-4 py-2">{r.description}</td>
                    <td className="px-4 py-2 text-right">{r.mileage.toLocaleString()} km</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

