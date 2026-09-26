import type {
  PerRefuelingConsumptionPoint,
  PerRefuelingConsumptionResponse,
} from "@shared/schemas/statistics.js";
import type { ChartOptions } from "chart.js";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchPerRefuelingConsumption } from "../api/statistics";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/** Fixed colour palette for vehicle lines (same as the other dashboard charts) */
const VEHICLE_COLORS = [
  "rgb(59, 130, 246)", // blue
  "rgb(239, 68, 68)", // red
  "rgb(16, 185, 129)", // green
  "rgb(245, 158, 11)", // amber
  "rgb(139, 92, 246)", // violet
  "rgb(236, 72, 153)", // pink
  "rgb(14, 165, 233)", // sky
  "rgb(168, 85, 247)", // purple
];

/** Converts an ISO date (YYYY-MM-DD) to dd/mm/yyyy */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export default function RefuelingConsumptionChart() {
  const [data, setData] = useState<PerRefuelingConsumptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerRefuelingConsumption()
      .then(setData)
      .catch(() => setError("Failed to load consumption per refueling chart"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading chart...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data || data.points.length === 0) {
    return (
      <p className="text-gray-400 py-4 text-center">
        No refueling data available for the last 12 months.
      </p>
    );
  }

  // Shared X axis: unique refueling dates across all vehicles, ascending
  const dates = [...new Set(data.points.map((p) => p.date))].sort();
  const dateIndex = new Map(dates.map((d, i) => [d, i]));

  // Per vehicle: points aligned with the shared dates (null where the vehicle has no refueling)
  const pointsByVehicle: (PerRefuelingConsumptionPoint | null)[][] = data.vehicles.map(() =>
    new Array(dates.length).fill(null),
  );
  for (const point of data.points) {
    const idx = dateIndex.get(point.date);
    if (idx !== undefined) pointsByVehicle[point.vehicleIndex][idx] = point;
  }

  const datasets = data.vehicles.map((name, vIdx) => ({
    label: name,
    data: pointsByVehicle[vIdx].map((p) => (p ? p.litersPer100km : null)),
    borderColor: VEHICLE_COLORS[vIdx % VEHICLE_COLORS.length],
    backgroundColor: VEHICLE_COLORS[vIdx % VEHICLE_COLORS.length],
    fill: false,
    tension: 0.3,
    pointRadius: 3,
    spanGaps: true,
  }));

  const chartData = {
    labels: dates.map(formatDate),
    datasets,
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const point = pointsByVehicle[ctx.datasetIndex]?.[ctx.dataIndex];
            if (!point) return `${ctx.dataset.label}: N/A`;
            return `${ctx.dataset.label}: ${point.litersPer100km.toFixed(2)} L/100km (${point.liters.toFixed(2)} L, ${point.kmTraveled} km)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "L/100km" },
      },
    },
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Fuel Consumption per Refueling (L/100km)
      </h2>
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <Line data={chartData} options={options} />
      </div>
    </section>
  );
}
