import type { Reminder } from "@shared/schemas/reminder.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { useRef, useState } from "react";
import {
  getReminderColor,
  REMINDER_BADGE_CLASSES,
  REMINDER_ROW_CLASSES,
} from "../utils/reminderColor";
import ReminderRowTooltip, { type TooltipPos } from "./ReminderRowTooltip";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

const TOOLTIP_APPROX_HEIGHT = 200;

export default function ReminderTableRow({ r }: { r: Reminder & { vehicle: Vehicle } }) {
  const color = getReminderColor(r, r.vehicle.currentMileage);
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const ref = useRef<HTMLTableRowElement | null>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow >= TOOLTIP_APPROX_HEIGHT) {
        setPos({ left: rect.left, top: rect.bottom + 4 });
      } else {
        setPos({ left: rect.left, bottom: window.innerHeight - rect.top + 4 });
      }
    }
  };

  const handleMouseLeave = () => setPos(null);

  return (
    <tr
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`border-t border-gray-100 hover:brightness-95 cursor-default ${REMINDER_ROW_CLASSES[color]}`}
    >
      <td className="px-4 py-2 font-medium">
        <a href={`/vehicles/${r.vehicleId}`} className="text-blue-600 hover:underline">
          {r.vehicle.name}
        </a>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <span className={REMINDER_BADGE_CLASSES[color]} aria-hidden="true" />
        {formatDate(r.date)}
      </td>
      <td className="px-4 py-2 text-right">{r.mileage.toLocaleString()} km</td>
      <ReminderRowTooltip reminder={r} color={color} pos={pos} />
    </tr>
  );
}
