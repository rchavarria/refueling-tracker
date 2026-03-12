import MonthlyAggregateTable from "../components/MonthlyAggregateTable";
import UpcomingReminders from "../components/UpcomingReminders";
import VehicleCharts from "../components/VehicleCharts";

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Monthly Aggregate Table */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Last 12 Months</h2>
        <MonthlyAggregateTable />
      </section>

      {/* Upcoming Reminders */}
      <UpcomingReminders />

      {/* Vehicle Charts */}
      <VehicleCharts />
    </div>
  );
}

