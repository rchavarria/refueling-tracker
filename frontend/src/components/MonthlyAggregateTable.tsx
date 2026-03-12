import type { MonthlyAggregateRow } from "@shared/schemas/statistics.js";
import { useEffect, useState } from "react";
import { fetchMonthlyAggregate } from "../api/statistics";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${year}`;
}

export default function MonthlyAggregateTable() {
  const [data, setData] = useState<MonthlyAggregateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonthlyAggregate()
      .then(setData)
      .catch(() => setError("Failed to load monthly statistics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (data.every((r) => r.totalKm === 0 && r.totalLiters === 0)) {
    return (
      <p className="text-gray-400 py-4 text-center">
        No refueling data available for the last 12 months.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50 text-gray-600 text-left">
          <tr>
            <th className="px-4 py-2">Month</th>
            <th className="px-4 py-2 text-right">Total km</th>
            <th className="px-4 py-2 text-right">Total liters</th>
            <th className="px-4 py-2 text-right">Total cost (€)</th>
            <th className="px-4 py-2 text-right">Avg L/100km</th>
            <th className="px-4 py-2 text-right">Avg €/km</th>
          </tr>
        </thead>
        <tbody>
          {[...data].reverse().map((row) => (
            <tr key={row.month} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-2 font-medium">{formatMonth(row.month)}</td>
              <td className="px-4 py-2 text-right">{row.totalKm.toLocaleString("en")} km</td>
              <td className="px-4 py-2 text-right">{row.totalLiters.toFixed(2)} L</td>
              <td className="px-4 py-2 text-right">{row.totalCost.toFixed(2)} €</td>
              <td className="px-4 py-2 text-right">
                {row.avgLitersPer100km !== null ? row.avgLitersPer100km.toFixed(2) : "N/A"}
              </td>
              <td className="px-4 py-2 text-right">
                {row.avgCostPerKm !== null ? row.avgCostPerKm.toFixed(2) : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
