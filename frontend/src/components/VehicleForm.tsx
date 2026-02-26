import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateVehicle } from "@shared/schemas/vehicle.js";
import { createVehicleSchema } from "@shared/schemas/vehicle.js";
import { useForm } from "react-hook-form";

interface Props {
  onSubmit: (data: CreateVehicle) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export default function VehicleForm({ onSubmit, error, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateVehicle>({ resolver: zodResolver(createVehicleSchema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          {...register("name")}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="My Car"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
        <input
          {...register("brand")}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Toyota"
        />
        {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
        <input
          {...register("model")}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Corolla"
        />
        {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
        <input
          {...register("licensePlate")}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1234 ABC"
        />
        {errors.licensePlate && (
          <p className="text-red-500 text-xs mt-1">{errors.licensePlate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
        <input
          {...register("year", { valueAsNumber: true })}
          type="number"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="2020"
        />
        {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save Vehicle"}
      </button>
    </form>
  );
}

