import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateReminder } from "@shared/schemas/reminder.js";
import {
  createReminderSchema,
  REMINDER_TYPE_LABELS,
  reminderTypeEnum,
} from "@shared/schemas/reminder.js";
import { useForm } from "react-hook-form";

interface FormValues {
  date: string;
  description: string;
  type: string;
  mileage: number;
  enabled: boolean;
}

interface Props {
  onSubmit: (data: CreateReminder) => Promise<void>;
  defaultValues?: Partial<FormValues>;
  error?: string;
  loading?: boolean;
}

export default function ReminderForm({ onSubmit, defaultValues, error, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    // biome-ignore lint/suspicious/noExplicitAny: zodResolver type inference mismatch with react-hook-form
    resolver: zodResolver(createReminderSchema) as any,
    defaultValues: {
      enabled: true,
      ...defaultValues,
    },
  });

  async function handleValid(values: FormValues) {
    const iso = new Date(values.date).toISOString().split("T")[0];
    await onSubmit({ ...values, date: iso } as CreateReminder);
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-4 max-w-lg">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date *
        </label>
        <input
          {...register("date")}
          id="date"
          type="date"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <input
          {...register("description")}
          id="description"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Oil change, insurance renewal..."
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type *
        </label>
        <select
          {...register("type")}
          id="type"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a type...</option>
          {reminderTypeEnum.options.map((value) => (
            <option key={value} value={value}>
              {REMINDER_TYPE_LABELS[value]}
            </option>
          ))}
        </select>
        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
      </div>

      <div>
        <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
          Mileage (km) *
        </label>
        <input
          {...register("mileage", { valueAsNumber: true })}
          id="mileage"
          type="number"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="85000"
        />
        {errors.mileage && <p className="text-red-500 text-xs mt-1">{errors.mileage.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          {...register("enabled")}
          type="checkbox"
          id="enabled"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
          Enabled
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save Reminder"}
      </button>
    </form>
  );
}
