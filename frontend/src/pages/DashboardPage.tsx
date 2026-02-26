import type { Refueling } from "@shared/schemas/refueling.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";
import { calculateConsumption } from "@shared/statistics/index.js";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { fetchVehicleRefuelings } from "../api/refuelings";
import { fetchVehicles } from "../api/vehicles";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [refuelings, setRefuelings] = useState<Refueling[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingRefuelings, setLoadingRefuelings] = useState(false);

  // Load vehicle list on mount
  useEffect(() => {
    fetchVehicles()
      .then((list) => {
        setVehicles(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .finally(() => setLoadingVehicles(false));
  }, []);

  // Load refuelings whenever selected vehicle changes
  useEffect(() => {
    if (selectedId === null) return;
    setLoadingRefuelings(true);
    fetchVehicleRefuelings(selectedId)
      .then(setRefuelings)
      .finally(() => setLoadingRefuelings(false));
  }, [selectedId]);

  const stats = calculateConsumption(
    refuelings.map((r) => ({ mileage: r.mileage, liters: r.liters, totalPrice: r.totalPrice })),
  );

  // Only entries with computed stats (skip first which is always null)
  const labels = refuelings
    .map((r, i) => (stats[i].litersPer100km !== null ? formatDate(r.date) : null))
    .filter(Boolean) as string[];

  const l100kmData = stats
    .map((s) => s.litersPer100km)
    .filter((v): v is number => v !== null);

  const costPerKmData = stats
    .map((s) => s.costPerKm)
    .filter((v): v is number => v !== null);

  const lineData = {
    labels,
    datasets: [
      {
        label: "L/100km",
        data: l100kmData,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: "€/km",
        data: costPerKmData,
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" as const } },
  };

  if (loadingVehicles) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        {vehicles.length > 0 && (
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No vehicles yet.</p>
          <a href="/vehicles/new" className="text-blue-500 hover:underline mt-2 inline-block">
            Add your first vehicle
          </a>
        </div>
      ) : loadingRefuelings ? (
        <p className="text-gray-500">Loading refuelings...</p>
      ) : l100kmData.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">
          Not enough refueling data to show charts. Add at least 2 refuelings.
        </p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Fuel Consumption (L/100km)
            </h2>
            <Line data={lineData} options={chartOptions} />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Cost per km (€/km)</h2>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}

