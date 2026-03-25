import MonthlyAggregateTable from "../components/MonthlyAggregateTable";
import MonthlyConsumptionChart from "../components/MonthlyConsumptionChart";
import MonthlyKmChart from "../components/MonthlyKmChart";
import UpcomingReminders from "../components/UpcomingReminders";

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <MonthlyAggregateTable />

      <MonthlyKmChart />

      <MonthlyConsumptionChart />

      <UpcomingReminders />
    </div>
  );
}

