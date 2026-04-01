import MonthlyConsumptionChart from "../components/MonthlyConsumptionChart";
import MonthlyKmChart from "../components/MonthlyKmChart";
import UpcomingReminders from "../components/UpcomingReminders";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3">
        <UpcomingReminders />
      </div>
      <div className="lg:col-span-9">
        <MonthlyKmChart />
        <MonthlyConsumptionChart />
      </div>
    </div>
  );
}
