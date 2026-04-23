import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, ClipboardList, GraduationCap, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export function ConsultorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Definición de las rutas principales del consultor
  const navItems = [
    { path: '/consultor', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/consultor/auditorias', label: 'Mis auditorías', icon: ClipboardList },
    { path: '/consultor/capacitaciones', label: 'Capacitaciones', icon: GraduationCap },
  ];

  const isActive = (path: string) => {
    if (path === '/consultor') {
      return location.pathname === '/consultor';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Sidebar - Menú Lateral */}
      <aside className="w-64 bg-white border-r border-[#E8E8E8] flex flex-col">
        {/* Logo Encapsulado para ocultar bordes grises */}
        <div className="p-6 border-b border-[#E8E8E8] flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-[#E8E8E8] shrink-0">
            <img
              src="/logo.png"
              alt="ConsultoSec Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col">
            <h2 className="text-[15px] font-bold text-[#003087] leading-tight">
              Sistema de Consultoria 
            </h2>
            <p className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
              UNISON
            </p>
          </div>
        </div>

        {/* Navegación por Módulos */}
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

        {/* Sección de Salida */}
        <div className="p-4 border-t border-[#E8E8E8]">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] text-gray-700 hover:bg-[#F5F5F5] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col">
        {/* Barra Superior con Perfil de Consultor [cite: 163] */}
        <header className="bg-white border-b border-[#E8E8E8] px-8 py-3">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 pr-3 rounded-xl transition-colors border border-transparent hover:border-[#E8E8E8]">
              {/* Avatar con iniciales */}
              <div className="w-9 h-9 rounded-full bg-[#003087] flex items-center justify-center text-white text-[13px] font-semibold tracking-wider uppercase">
                {user ? user.first_name?.[0] : "JU"}
              </div>

              <div className="flex flex-col text-left">
                <span className="text-[14px] font-semibold text-gray-900 leading-tight">
                  {user ? `${user.first_name} ${user.last_name}` : "Jesús Uzcanga"}
                </span>
                <span className="text-[12px] text-gray-500 font-medium">
                  {user ? user.role : "Consultor"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
            </div>
          </div>
        </header>

        {/* Espacio donde se cargarán las páginas (Dashboard, Auditorías, etc.) */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}