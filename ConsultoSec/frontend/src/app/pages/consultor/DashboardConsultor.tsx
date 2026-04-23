import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ClipboardList, Clock, AlertCircle, Wrench, ChevronRight } from 'lucide-react';
import { consultasService, Consulta } from '../../../features/consultas/services/consultasService';
import { useAuth } from '../../../features/auth/AuthContext';

const getEstadoInfo = (estado: string) => {
  switch (estado) {
    case 'agendada': return { label: 'Agendado', badgeColor: 'bg-gray-500', accion: 'Ver detalles' };
    case 'revision_previa': return { label: 'Revisión Previa', badgeColor: 'bg-[#8B5CF6]', accion: 'Iniciar Revisión' };
    case 'revision_verificacion': return { label: 'Revisión con Lista de Verificación', badgeColor: 'bg-[#003087]', accion: 'Continuar Checklist' };
    case 'mejoras_solicitadas': return { label: 'En Mejoras', badgeColor: 'bg-[#F59E0B]', accion: 'Actualizar Gantt' };
    case 'ultima_revision': return { label: 'Última Revisión', badgeColor: 'bg-[#8B5CF6]', accion: 'Generar Reporte' };
    case 'finalizada': return { label: 'Finalizada', badgeColor: 'bg-[#1D9E75]', accion: 'Ver Reporte' };
    case 'pendiente': return { label: 'Pendiente', badgeColor: 'bg-red-500', accion: 'Atender' };
    case 'cancelada': return { label: 'Cancelada', badgeColor: 'bg-gray-800', accion: 'Ver detalles' };
    default: return { label: estado, badgeColor: 'bg-gray-500', accion: 'Ver detalles' };
  }
};

const getProgress = (consulta: Consulta) => {
  if (!consulta.items_checklist || consulta.items_checklist.length === 0) return 0;
  const evaluados = consulta.items_checklist.filter(item => item.cumple !== 'no_evaluado').length;
  return Math.round((evaluados / consulta.items_checklist.length) * 100);
};

export function DashboardConsultor() {
  const { token } = useAuth();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      consultasService.obtenerConsultas(token).then((data) => {
        setConsultas(data);
        setLoading(false);
      }).catch(err => {
        console.error("Error al cargar consultas:", err);
        setLoading(false);
      });
    }
  }, [token]);

  const kpis = [
    { label: 'Auditorías asignadas', value: consultas.length.toString(), icon: ClipboardList, color: '#003087' },
    { label: 'Checklists en curso', value: consultas.filter(c => c.estado === 'revision_verificacion').length.toString(), icon: Clock, color: '#F59E0B' },
    { label: 'Mejoras en implementación', value: consultas.filter(c => c.estado === 'mejoras_solicitadas').length.toString(), icon: Wrench, color: '#1D9E75' },
  ];

  const tareasPendientes = consultas.filter(c => c.estado !== 'finalizada' && c.estado !== 'cancelada')
    .slice(0, 5) // Mostrar máximo las próximas 5 tareas para no saturar
    .map(c => {
      let titulo = 'Continuar seguimiento de consulta';
      let tipo = 'General';
      let tiempo = '--';

      if (c.estado === 'revision_previa' || c.estado === 'revision_verificacion') {
        titulo = 'Completar Checklist asignado';
        tipo = 'Checklist';
        tiempo = 'Requiere atención';
      } else if (c.estado === 'mejoras_solicitadas') {
        titulo = 'Revisar evidencias de mejoras';
        tipo = 'Evidencias';
        tiempo = 'Pendiente de revisión';
      } else if (c.estado === 'agendada') {
        titulo = 'Preparar visita a instalaciones';
        tipo = 'Visita';
        tiempo = new Date(c.fecha_creacion).toLocaleDateString();
      }

      return {
        titulo,
        lab: c.area_nombre || 'Área no asignada',
        tipo,
        tiempo
      };
    });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-[20px] font-medium text-gray-900">Mi Panel de Consultor</h1>
        <p className="text-[14px] text-gray-500 mt-1">Resumen de tus auditorías y tareas de mejora continua.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-6 border border-[#E8E8E8] hover:shadow-md transition-shadow">
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
            {consultas.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border border-dashed rounded-lg">No tienes auditorías asignadas en este momento.</div>
            ) : consultas.map((audit) => {
              const info = getEstadoInfo(audit.estado);
              const progresoNum = getProgress(audit);
              const fechaStr = new Date(audit.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

              return (
                <Card key={audit.id} className="p-5 border border-[#E8E8E8] hover:border-gray-300 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-[15px] font-bold text-gray-900">{audit.area_nombre || `Consulta #${audit.id}`}</h3>
                        <Badge className={`${info.badgeColor} text-white text-[11px] font-medium px-2 py-0.5 border-none shadow-none`}>{info.label}</Badge>
                      </div>
                      <p className="text-[13px] text-gray-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Creada: {fechaStr}</p>
                    </div>

                    <div className="hidden md:block w-32">
                      <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
                        <span>Avance</span><span className="font-medium">{progresoNum}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#003087] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progresoNum}%` }}></div>
                      </div>
                    </div>

                    <Button className="w-full md:w-auto bg-white border border-[#E8E8E8] text-gray-700 hover:bg-gray-50 hover:text-[#003087] shadow-sm text-[13px]">
                      {info.accion}<ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[16px] font-semibold text-gray-900">Seguimiento de Tareas</h2>
          <Card className="border border-[#E8E8E8] overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-[#E8E8E8]">
              <p className="text-[13px] font-medium text-gray-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-[#F59E0B]" />Acciones requeridas</p>
            </div>
            <div className="divide-y divide-[#E8E8E8]">
              {tareasPendientes.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-gray-500">No hay tareas pendientes en este momento.</div>
              ) : tareasPendientes.map((tarea, idx) => (
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