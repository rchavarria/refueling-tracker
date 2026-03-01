import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateRefueling } from "@shared/schemas/refueling.js";
import { createRefuelingSchema } from "@shared/schemas/refueling.js";
import { useForm } from "react-hook-form";

interface FormValues {
  date: string;
  liters: number;
  totalPrice: number;
  mileage: number;
  station?: string;
}

interface Props {
  onSubmit: (data: CreateRefueling) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export default function RefuelingForm({ onSubmit, error, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(createRefuelingSchema) });

  async function handleValid(values: FormValues) {
    const iso = new Date(values.date).toISOString().split("T")[0];
    await onSubmit({ ...values, date: iso });
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-4 max-w-lg">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
        <input
          {...register("date")}
          type="date"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Liters *</label>
        <input
          {...register("liters", { valueAsNumber: true })}
          type="number"
          step="0.01"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="45.50"
        />
        {errors.liters && <p className="text-red-500 text-xs mt-1">{errors.liters.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (€) *</label>
        <input
          {...register("totalPrice", { valueAsNumber: true })}
          type="number"
          step="0.01"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="68.25"
        />
        {errors.totalPrice && (
          <p className="text-red-500 text-xs mt-1">{errors.totalPrice.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km) *</label>
        <input
          {...register("mileage", { valueAsNumber: true })}
          type="number"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="85000"
        />
        {errors.mileage && <p className="text-red-500 text-xs mt-1">{errors.mileage.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
        <input
          {...register("station")}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Repsol, Cepsa..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save Refueling"}
      </button>
    </form>
  );
}

