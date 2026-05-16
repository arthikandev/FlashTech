import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardRoute } from "./dashboard/DashboardRoute";
import { SeylanPage } from "./demos/SeylanPage";
import { CloudMetricsPage } from "./demos/CloudMetricsPage";
import { CoralPage } from "./demos/CoralPage";
import { LandingPage } from "./landing/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="dashboard" element={<DashboardRoute />} />
          <Route path="demos/seylan" element={<SeylanPage />} />
          <Route path="demos/cloudmetrics" element={<CloudMetricsPage />} />
          <Route path="demos/coral" element={<CoralPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
