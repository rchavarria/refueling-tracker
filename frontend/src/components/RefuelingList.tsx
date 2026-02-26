import type { ConsumptionResult } from "@shared/statistics/index.js";
import type { Refueling } from "@shared/schemas/refueling.js";

interface Props {
  refuelings: Refueling[];
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

export default function RefuelingList({ refuelings, stats }: Props) {
  if (refuelings.length === 0) {
    return <p className="text-gray-400 py-8 text-center">No refuelings recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-right">Liters</th>
            <th className="px-4 py-3 text-right">Total (€)</th>
            <th className="px-4 py-3 text-right">Total km</th>
            <th className="px-4 py-3 text-right">km Traveled</th>
            <th className="px-4 py-3 text-right">L/100km</th>
            <th className="px-4 py-3 text-right">€/km</th>
            <th className="px-4 py-3 text-left">Station</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {refuelings.map((r, i) => {
            const s = stats[i];
            return (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.date)}</td>
                <td className="px-4 py-3 text-right">{r.liters.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{r.totalPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{r.mileage.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{fmt(s?.kmTraveled ?? null, 0)}</td>
                <td className="px-4 py-3 text-right">{fmt(s?.litersPer100km ?? null)}</td>
                <td className="px-4 py-3 text-right">{fmt(s?.costPerKm ?? null)}</td>
                <td className="px-4 py-3 text-gray-500">{r.station ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

