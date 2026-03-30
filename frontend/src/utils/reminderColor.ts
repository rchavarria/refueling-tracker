import type { Reminder } from "@shared/schemas/reminder.js";

export type ReminderColor = "red" | "orange" | "green";

/**
 * Determines the urgency color for a reminder based on due date proximity
 * and remaining mileage. The most urgent color wins.
 */
export function getReminderColor(
  reminder: Pick<Reminder, "date" | "mileage">,
  currentMileage: number | null,
): ReminderColor {
  const today = new Date(new Date().toISOString().split("T")[0]);
  const dueDate = new Date(reminder.date);
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let colorByDate: ReminderColor;
  if (diffDays <= 7) colorByDate = "red";
  else if (diffDays <= 30) colorByDate = "orange";
  else colorByDate = "green";

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

export const REMINDER_ROW_CLASSES: Record<ReminderColor, string> = {
  red: "bg-red-50",
  orange: "bg-orange-50",
  green: "bg-green-50",
};

export const REMINDER_BADGE_CLASSES: Record<ReminderColor, string> = {
  red: "inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-2",
  orange: "inline-block w-2.5 h-2.5 rounded-full bg-orange-400 mr-2",
  green: "inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2",
};

