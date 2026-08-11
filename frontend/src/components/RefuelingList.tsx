import type { Refueling } from "@shared/schemas/refueling.js";
import type { ConsumptionResult } from "@shared/statistics/index.js";
import { useState } from "react";
import { Link } from "react-router-dom";

const DEFAULT_VISIBLE = 10;

interface Props {
  refuelings: Refueling[];
  vehicleId: number;
  stats: ConsumptionResult[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function fmt(value: number | null, decimals = 2, suffix = ""): string {
  if (value === null) return "N/A";
  return `${value.toFixed(decimals)}${suffix}`;
}

export default function RefuelingList({ refuelings, vehicleId, stats }: Props) {
  const [showAll, setShowAll] = useState(false);

  if (refuelings.length === 0) {
    return <p className="text-gray-400 py-8 text-center">No refuelings recorded yet.</p>;
  }

  const canCollapse = refuelings.length > DEFAULT_VISIBLE;
  const visibleRefuelings = showAll ? refuelings : refuelings.slice(0, DEFAULT_VISIBLE);
  const visibleStats = showAll ? stats : stats.slice(0, DEFAULT_VISIBLE);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mt-10 mb-6">
        <h2 className="text-lg font-semibold text-gray-700">Refuelings</h2>

        <Link
          to={`/vehicles/${vehicleId}/refuelings/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          + Add Refueling
        </Link>
      </div>

      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-right">Liters</th>
            <th className="px-4 py-3 text-right">Total (€)</th>
            <th className="px-4 py-3 text-right">Total km</th>
            <th className="px-4 py-3 text-right">km Traveled</th>
            <th className="px-4 py-3 text-right">L/100km</th>
            <th className="px-4 py-3 text-left">Station</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {visibleRefuelings.map((r, i) => {
            const s = visibleStats[i];
            return (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.date)}</td>
                <td className="px-4 py-3 text-right">{r.liters.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{r.totalPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{r.mileage.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{fmt(s?.kmTraveled ?? null, 0)}</td>
                <td className="px-4 py-3 text-right">{fmt(s?.litersPer100km ?? null)}</td>
                <td className="px-4 py-3 text-gray-500">{r.station ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {canCollapse && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            {showAll ? "Show last 10" : `Show all (${refuelings.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
