import type { Reminder } from "@shared/schemas/reminder.js";
import { REMINDER_TYPE_LABELS, type ReminderType } from "@shared/schemas/reminder.js";
import { Link, useNavigate } from "react-router-dom";
import { deleteReminder } from "../api/reminders";
import {
  getReminderColor,
  REMINDER_BADGE_CLASSES,
  REMINDER_ROW_CLASSES,
} from "../utils/reminderColor";

interface Props {
  reminders: Reminder[];
  vehicleId: number;
  currentMileage?: number | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ReminderList({ reminders, vehicleId, currentMileage }: Props) {
  const navigate = useNavigate();

  if (reminders.length === 0) {
    return <p className="text-gray-400 py-8 text-center">No reminders recorded yet.</p>;
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this reminder?")) return;
    await deleteReminder(id);
    navigate(`/vehicles/${vehicleId}`);
    navigate(0); // refresh
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Reminders</h2>

        <Link
          to={`/vehicles/${vehicleId}/reminders/new`}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
        >
          + Add Reminder
        </Link>
      </div>

      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left flex items-center gap-2">Type</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Description</th>
            <th className="px-4 py-3 text-right">Mileage</th>
            <th className="px-4 py-3 text-center">Enabled</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {reminders.map((r) => {
            const color =
              r.enabled && currentMileage !== undefined
                ? getReminderColor(r, currentMileage ?? null)
                : null;
            return (
              <tr
                key={r.id}
                className={`hover:brightness-95 ${color ? REMINDER_ROW_CLASSES[color] : "hover:bg-gray-50"}`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {REMINDER_TYPE_LABELS[r.type as ReminderType] ?? r.type}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {color && <span className={REMINDER_BADGE_CLASSES[color]} aria-hidden="true" />}
                  {formatDate(r.date)}
                </td>
                <td className="px-4 py-3 max-w-xs truncate" title={r.description}>
                  {r.description}
                </td>
                <td className="px-4 py-3 text-right">{r.mileage.toLocaleString()} km</td>
                <td className="px-4 py-3 text-center">
                  {r.enabled ? (
                    <span
                      className="inline-block w-3 h-3 rounded-full bg-green-500"
                      title="Enabled"
                    />
                  ) : (
                    <span
                      className="inline-block w-3 h-3 rounded-full bg-gray-300"
                      title="Disabled"
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/vehicles/${vehicleId}/reminders/${r.id}/edit`)}
                    className="inline-flex items-center justify-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 cursor-pointer"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="inline-flex items-center justify-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 cursor-pointer"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
