import { z } from "zod";

/** Allowed reminder types */
export const reminderTypeEnum = z.enum([
  "maintenance",
  "registration",
  "insurance",
  "inspection",
  "other",
]);

/** Human-readable labels for each reminder type */
export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  maintenance: "Maintenance",
  registration: "Registration",
  insurance: "Insurance",
  inspection: "Inspection",
  other: "Other",
};

/** Shape used when creating a reminder (no id, no vehicleId — extracted from route) */
export const createReminderSchema = z.object({
  date: z.string().date("Date must be a valid date string"),
  description: z.string().min(1, "Description is required"),
  type: reminderTypeEnum,
  mileage: z.number().int().positive("Mileage must be a positive integer"),
  enabled: z.boolean(),
});

/** Partial version for PUT requests */
export const updateReminderSchema = createReminderSchema.partial();

/** Full reminder as returned by the API (includes id and vehicleId) */
export const reminderSchema = createReminderSchema.extend({
  id: z.number().int(),
  vehicleId: z.number().int(),
});

export type ReminderType = z.infer<typeof reminderTypeEnum>;
export type CreateReminder = z.infer<typeof createReminderSchema>;
export type UpdateReminder = z.infer<typeof updateReminderSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
