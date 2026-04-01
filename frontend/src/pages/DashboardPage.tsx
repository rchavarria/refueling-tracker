import MonthlyConsumptionChart from "../components/MonthlyConsumptionChart";
import MonthlyKmChart from "../components/MonthlyKmChart";
import UpcomingReminders from "../components/UpcomingReminders";

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <UpcomingReminders />
        </div>
        <div className="lg:col-span-9">
          <MonthlyKmChart />
          <MonthlyConsumptionChart />
        </div>
      </div>
    </div>
  );
}
