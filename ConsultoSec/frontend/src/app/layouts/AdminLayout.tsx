import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, FileText, Users, BarChart3, LogOut } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/solicitudes', label: 'Solicitudes', icon: FileText },
    { path: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { path: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E8E8E8] flex flex-col">
        <div className="p-6 border-b border-[#E8E8E8]">
          <h2 className="text-[16px] font-medium text-[#003087]">
            Sistema de Consultoría
          </h2>
          <p className="text-[12px] text-gray-500 mt-1">UNISON</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] transition-colors ${
                  active
                    ? 'bg-[#003087] text-white'
                    : 'text-gray-700 hover:bg-[#F5F5F5]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E8E8E8]">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] text-gray-700 hover:bg-[#F5F5F5] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E8E8E8] px-8 py-4">
          <div className="flex items-center justify-end gap-4">
            <div className="text-right">
              <p className="text-[14px] font-medium">Maestra Viridiana</p>
              <Badge className="bg-[#003087] text-white hover:bg-[#003087] text-[12px] px-2 py-0.5 mt-1">
                Administrador
              </Badge>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
