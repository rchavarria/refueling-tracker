import type { MonthlyKmPerVehicleResponse } from "@shared/schemas/statistics.js";
import type { ChartOptions } from "chart.js";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchMonthlyKmPerVehicle } from "../api/statistics";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Fixed colour palette for vehicle lines */
const VEHICLE_COLORS = [
  "rgb(59, 130, 246)",   // blue
  "rgb(239, 68, 68)",    // red
  "rgb(16, 185, 129)",   // green
  "rgb(245, 158, 11)",   // amber
  "rgb(139, 92, 246)",   // violet
  "rgb(236, 72, 153)",   // pink
  "rgb(14, 165, 233)",   // sky
  "rgb(168, 85, 247)",   // purple
];

/** Convert "rgb(r, g, b)" to "rgba(r, g, b, alpha)" */
function withAlpha(rgb: string, alpha: number): string {
  return rgb.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${year}`;
}

export default function MonthlyKmChart() {
  const [data, setData] = useState<MonthlyKmPerVehicleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonthlyKmPerVehicle()
      .then(setData)
      .catch(() => setError("Failed to load km per vehicle chart"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading chart...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data || data.vehicles.length === 0) {
    return (
      <p className="text-gray-400 py-4 text-center">
        No refueling data available to display the km chart.
      </p>
    );
  }

  const labels = data.rows.map((r) => formatMonth(r.month));

  // One dataset per vehicle (stacked area)
  const vehicleDatasets = data.vehicles.map((name, idx) => ({
    label: name,
    data: data.rows.map((r) => r.vehicleKm[idx]),
    borderColor: VEHICLE_COLORS[idx % VEHICLE_COLORS.length],
    backgroundColor: withAlpha(VEHICLE_COLORS[idx % VEHICLE_COLORS.length], 0.3),
    fill: true,
    tension: 0.3,
    pointRadius: 3,
  }));

  const chartData = {
    labels,
    datasets: vehicleDatasets,
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        title: { display: true, text: "km" },
      },
    },
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Km Traveled per Month</h2>
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <Line data={chartData} options={options} />
      </div>
    </section>
  );
}

