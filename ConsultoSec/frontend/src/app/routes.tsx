import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { AdminLayout } from "./layouts/AdminLayout";
import { ConsultorLayout } from "./layouts/ConsultorLayout";
import { DashboardAdmin } from "./pages/admin/DashboardAdmin";
import { Solicitudes } from "./pages/admin/Solicitudes";
import { Usuarios } from "./pages/admin/Usuarios";
import { DashboardConsultor } from "./pages/consultor/DashboardConsultor";
import { Capacitaciones } from "./pages/consultor/Capacitaciones";
import { Checklist } from "./pages/consultor/Checklist";
import { MisAuditorias } from "./pages/consultor/Auditorias";
import { Seguimiento } from "./pages/consultor/Seguimiento";
import { Reportes } from "./pages/admin/Reportes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardAdmin /> },
      { path: "solicitudes", element: <Solicitudes /> },
      { path: "usuarios", element: <Usuarios /> },
      { path: "capacitaciones", element: <Capacitaciones /> },
      { path: "reportes", element: <Reportes /> },
      { path: "seguimiento", element: <Seguimiento /> },

    ],
  },
  {
    path: "/consultor",
    element: <ConsultorLayout />,
    children: [
      { index: true, element: <DashboardConsultor /> },
      { path: "capacitaciones", element: <Capacitaciones /> },
      { path: "auditorias", element: <MisAuditorias /> },
      { path: "checklist", element: <Checklist /> },
      { path: "seguimiento", element: <Seguimiento /> },
    ],
  },
]);
