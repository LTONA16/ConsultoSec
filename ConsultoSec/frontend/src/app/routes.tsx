import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { AdminLayout } from "./layouts/AdminLayout";
import { ConsultorLayout } from "./layouts/ConsultorLayout";
import { DashboardAdmin } from "./pages/admin/DashboardAdmin";
import { Solicitudes } from "./pages/admin/Solicitudes";
import { Usuarios } from "./pages/admin/Usuarios";
import { Capacitaciones } from "./pages/consultor/Capacitaciones";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardAdmin /> },
      { path: "solicitudes", element: <Solicitudes /> },
      { path: "usuarios", element: <Usuarios /> },
    ],
  },
  {
    path: "/consultor",
    element: <ConsultorLayout />,
    children: [
      { index: true, element: <Capacitaciones /> },
      { path: "capacitaciones", element: <Capacitaciones /> },
    ],
  },
]);
