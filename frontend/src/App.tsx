import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import RefuelingNewPage from "./pages/RefuelingNewPage";
import ReminderEditPage from "./pages/ReminderEditPage";
import ReminderNewPage from "./pages/ReminderNewPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import VehicleListPage from "./pages/VehicleListPage";
import VehicleNewPage from "./pages/VehicleNewPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vehicles" element={<VehicleListPage />} />
          <Route path="/vehicles/new" element={<VehicleNewPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/vehicles/:id/refuelings/new" element={<RefuelingNewPage />} />
          <Route path="/vehicles/:id/reminders/new" element={<ReminderNewPage />} />
          <Route path="/vehicles/:id/reminders/:reminderId/edit" element={<ReminderEditPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

