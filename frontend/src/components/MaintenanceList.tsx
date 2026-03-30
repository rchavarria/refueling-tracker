import type {Maintenance} from "@shared/schemas/maintenance.js";
import {MAINTENANCE_TYPE_LABELS, type MaintenanceType} from "@shared/schemas/maintenance.js";
import {Link, useNavigate} from "react-router-dom";
import {deleteMaintenance} from "../api/maintenances";

interface Props {
  maintenances: Maintenance[];
  vehicleId: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function MaintenanceList({ maintenances, vehicleId }: Props) {
  const navigate = useNavigate();

  if (maintenances.length === 0) {
    return <p className="text-gray-400 py-8 text-center">No maintenances recorded yet.</p>;
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this maintenance?")) return;
    await deleteMaintenance(id);
    navigate(`/vehicles/${vehicleId}`);
    navigate(0); // refresh
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Maintenances</h2>
        <Link
          to={`/vehicles/${vehicleId}/maintenances/new`}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
        >
          + Add Maintenance
        </Link>
      </div>

      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Description</th>
            <th className="px-4 py-3 text-right">Mileage</th>
            <th className="px-4 py-3 text-right">Cost</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {maintenances.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                {MAINTENANCE_TYPE_LABELS[m.type as MaintenanceType] ?? m.type}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{formatDate(m.date)}</td>
              <td className="px-4 py-3 max-w-xs truncate" title={m.description}>{m.description}</td>
              <td className="px-4 py-3 text-right">{m.mileage.toLocaleString()} km</td>
              <td className="px-4 py-3 text-right">{m.cost.toFixed(2)} €</td>
              <td className="px-4 py-3 text-center space-x-2">
                <button
                  type="button"
                  onClick={() => navigate(`/vehicles/${vehicleId}/maintenances/${m.id}/edit`)}
                  className="inline-flex items-center justify-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 cursor-pointer"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="inline-flex items-center justify-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 cursor-pointer"
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

