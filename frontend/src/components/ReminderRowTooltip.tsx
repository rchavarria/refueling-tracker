import type { Reminder } from "@shared/schemas/reminder.js";
import { REMINDER_TYPE_LABELS, type ReminderType } from "@shared/schemas/reminder.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { createPortal } from "react-dom";
import type { ReminderColor } from "../utils/reminderColor";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

const TOOLTIP_CLASSES: Record<ReminderColor, string> = {
  red: "bg-red-50 border-red-300 text-red-900",
  orange: "bg-orange-50 border-orange-300 text-orange-900",
  green: "bg-green-50 border-green-300 text-green-900",
};

const TOOLTIP_HEADING: Record<ReminderColor, string> = {
  red: "text-red-700",
  orange: "text-orange-700",
  green: "text-green-700",
};

const TOOLTIP_DIVIDER: Record<ReminderColor, string> = {
  red: "border-red-200",
  orange: "border-orange-200",
  green: "border-green-200",
};

const TOOLTIP_LABEL: Record<ReminderColor, string> = {
  red: "text-red-600",
  orange: "text-orange-600",
  green: "text-green-600",
};

export interface TooltipPos {
  left: number;
  top?: number;
  bottom?: number;
}

interface Props {
  reminder: Reminder & { vehicle: Vehicle };
  color: ReminderColor;
  pos: TooltipPos | null;
}

export default function ReminderRowTooltip({ reminder, color, pos }: Props) {
  if (!pos) return null;

  return createPortal(
    <div
      style={{ position: "fixed", left: pos.left, top: pos.top, bottom: pos.bottom, zIndex: 50 }}
      className={`min-w-[300px] max-w-sm w-max rounded-xl border shadow-2xl px-4 py-3 text-sm pointer-events-none ${TOOLTIP_CLASSES[color]}`}
    >
      <p className={`text-base font-bold mb-3 ${TOOLTIP_HEADING[color]}`}>
        {reminder.vehicle.name}
      </p>
      <dl className="space-y-1.5">
        <div className="flex justify-between gap-6">
          <dt className={`font-semibold ${TOOLTIP_LABEL[color]}`}>Type</dt>
          <dd>{REMINDER_TYPE_LABELS[reminder.type as ReminderType]}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className={`font-semibold ${TOOLTIP_LABEL[color]}`}>Date</dt>
          <dd>{formatDate(reminder.date)}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className={`font-semibold ${TOOLTIP_LABEL[color]}`}>Mileage</dt>
          <dd>{reminder.mileage.toLocaleString()} km</dd>
        </div>
      </dl>
      {reminder.description && (
        <>
          <hr className={`my-3 border-t ${TOOLTIP_DIVIDER[color]}`} />
          <p className={`font-semibold mb-1 ${TOOLTIP_LABEL[color]}`}>Description</p>
          <p className="whitespace-pre-wrap leading-relaxed">{reminder.description}</p>
        </>
      )}
    </div>,
    document.body,
  );
}
