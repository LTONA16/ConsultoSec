import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ClipboardList, Clock, AlertCircle, Wrench, ChevronRight } from 'lucide-react';

export function DashboardConsultor() {
  const kpis = [
    { label: 'Auditorías asignadas', value: '4', icon: ClipboardList, color: '#003087' },
    { label: 'Checklists en curso', value: '2', icon: Clock, color: '#F59E0B' },
    { label: 'Mejoras en implementación', value: '12', icon: Wrench, color: '#1D9E75' },
  ];

  const auditorias = [
    { lab: 'Manufactura Avanzada', fecha: '18 Abr 2026', estado: 'Revisión con Lista de Verificación', badgeColor: 'bg-[#003087]', accion: 'Continuar Checklist', progreso: '45%' },
    { lab: 'Eléctrica', fecha: '20 Abr 2026', estado: 'Agendado', badgeColor: 'bg-gray-500', accion: 'Ver detalles', progreso: '0%' },
    { lab: 'Mecatrónica Básica', fecha: '10 Abr 2026', estado: 'En Mejoras', badgeColor: 'bg-[#F59E0B]', accion: 'Actualizar Gantt', progreso: '70%' },
    { lab: 'Química Industrial', fecha: '05 Abr 2026', estado: 'Última Revisión', badgeColor: 'bg-[#8B5CF6]', accion: 'Generar Reporte', progreso: '95%' },
  ];

  const tareasPendientes = [
    { titulo: 'Subir evidencia fotográfica', lab: 'Manufactura Avanzada', tipo: 'Checklist', tiempo: 'Vence hoy' },
    { titulo: 'Registrar capacitación de seguridad (EPP)', lab: 'Mecatrónica Básica', tipo: 'Capacitación', tiempo: 'Mañana' },
    { titulo: 'Redactar propuestas derivadas del IPERC', lab: 'Manufactura Avanzada', tipo: 'Propuestas', tiempo: 'En 3 días' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-[20px] font-medium text-gray-900">Mi Panel de Consultor</h1>
        <p className="text-[14px] text-gray-500 mt-1">Resumen de tus auditorías y tareas de mejora continua.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-6 border border-[#E8E8E8]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[14px] font-medium text-gray-600">{kpi.label}</p>
                  <p className="text-[28px] font-bold mt-2 text-gray-900">{kpi.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${kpi.color}15` }}>
                  <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-gray-900">Mis Auditorías Activas</h2>
            <Button variant="ghost" className="text-[13px] text-[#003087] hover:bg-blue-50">Ver todas</Button>
          </div>
          <div className="grid gap-4">
            {auditorias.map((audit) => (
              <Card key={audit.lab} className="p-5 border border-[#E8E8E8] hover:border-gray-300 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-[15px] font-bold text-gray-900">{audit.lab}</h3>
                      <Badge className={`${audit.badgeColor} text-white text-[11px] font-medium px-2 py-0.5 border-none shadow-none`}>{audit.estado}</Badge>
                    </div>
                    <p className="text-[13px] text-gray-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Visita agendada: {audit.fecha}</p>
                  </div>
                  <div className="hidden md:block w-32">
                    <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
                      <span>Avance</span><span className="font-medium">{audit.progreso}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#003087] h-1.5 rounded-full" style={{ width: audit.progreso }}></div>
                    </div>
                  </div>
                  <Button className="w-full md:w-auto bg-white border border-[#E8E8E8] text-gray-700 hover:bg-gray-50 hover:text-[#003087] shadow-sm text-[13px]">
                    {audit.accion}<ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[16px] font-semibold text-gray-900">Seguimiento de Tareas</h2>
          <Card className="border border-[#E8E8E8] overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-[#E8E8E8]">
              <p className="text-[13px] font-medium text-gray-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-[#F59E0B]" />Acciones requeridas</p>
            </div>
            <div className="divide-y divide-[#E8E8E8]">
              {tareasPendientes.map((tarea, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900 leading-tight">{tarea.titulo}</p>
                      <p className="text-[12px] text-gray-500 mt-1">{tarea.lab}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-[10px] text-gray-500 bg-white">{tarea.tipo}</Badge>
                    <span className="text-[11px] font-medium text-[#F59E0B]">{tarea.tiempo}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}