import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AlertCircle, CheckCircle2, TrendingUp, Clock, ClipboardList, Monitor, FlaskConical, Cog, HeartPulse, Microscope, Users, User, Hammer, Droplets, Cpu, Factory, Zap } from 'lucide-react';
import { consultasService, Consulta, Usuario } from '../../../features/consultas/services/consultasService';
import { useAuth } from '../../../features/auth/AuthContext';
import { ConsultaDetalleModal } from '../../../features/consultas/components/ConsultaDetalleModal';

const getEstadoInfo = (estado: string) => {
  switch (estado) {
    case 'agendada': return { label: 'Agendada', statusColor: 'bg-gray-500' };
    case 'revision_previa': return { label: 'Revisión Previa', statusColor: 'bg-[#8B5CF6]' };
    case 'revision_verificacion': return { label: 'En curso', statusColor: 'bg-[#003087]' };
    case 'mejoras_solicitadas': return { label: 'En Mejoras', statusColor: 'bg-[#F59E0B]' };
    case 'ultima_revision': return { label: 'Última Revisión', statusColor: 'bg-[#8B5CF6]' };
    case 'finalizada': return { label: 'Finalizado', statusColor: 'bg-[#1D9E75]' };
    case 'pendiente': return { label: 'Pendiente', statusColor: 'bg-red-500' };
    case 'cancelada': return { label: 'Cancelada', statusColor: 'bg-gray-800' };
    default: return { label: estado, statusColor: 'bg-gray-500' };
  }
};

const getLabIconAndColor = (areaName: string | undefined) => {
  if (!areaName) return { icon: ClipboardList, color: '#6B7280' };
  const name = areaName.toLowerCase();

  if (name.includes('carpintería')) return { icon: Hammer, color: '#8B4513' };
  if (name.includes('lavado')) return { icon: Droplets, color: '#0EA5E9' };
  if (name.includes('mecatrónica')) return { icon: Cpu, color: '#8B5CF6' };
  if (name.includes('manufactura')) return { icon: Factory, color: '#F59E0B' };
  if (name.includes('electrica') || name.includes('eléctrica')) return { icon: Zap, color: '#EAB308' };

  if (name.includes('cómputo') || name.includes('sistemas') || name.includes('redes') || name.includes('informátic')) return { icon: Monitor, color: '#3B82F6' };
  if (name.includes('químic') || name.includes('biolog') || name.includes('clínic') || name.includes('alimento') || name.includes('físic')) return { icon: FlaskConical, color: '#10B981' };
  if (name.includes('mecánic') || name.includes('civil')) return { icon: Cog, color: '#F59E0B' };
  if (name.includes('salud') || name.includes('enfermería') || name.includes('medicina') || name.includes('deporte')) return { icon: HeartPulse, color: '#EF4444' };

  const colors = ['#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'];
  const colorIndex = name.length % colors.length;
  return { icon: Microscope, color: colors[colorIndex] };
};

export function DashboardAdmin() {
  const { token } = useAuth();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [consultores, setConsultores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<Consulta | null>(null);

  useEffect(() => {
    if (token) {
      Promise.all([
        consultasService.obtenerConsultas(token),
        consultasService.obtenerConsultores(token).catch(() => [])
      ]).then(([data, consultoresData]) => {
        // Ordenamos las consultas más recientes primero
        const ordenadas = data.sort((a, b) => new Date(b.fecha_actualizacion || b.fecha_creacion).getTime() - new Date(a.fecha_actualizacion || a.fecha_creacion).getTime());
        setConsultas(ordenadas);
        setConsultores(consultoresData);
        setLoading(false);
      }).catch(err => {
        console.error("Error al cargar consultas:", err);
        setLoading(false);
      });
    }
  }, [token]);

  const activas = consultas.filter(c => c.estado !== 'finalizada' && c.estado !== 'cancelada');
  const finalizadas = consultas.filter(c => c.estado === 'finalizada');

  const kpis = [
    {
      label: 'Auditorías activas',
      value: activas.length.toString(),
      icon: Clock,
      color: '#003087',
    },
    {
      label: 'Auditorías finalizadas',
      value: finalizadas.length.toString(),
      icon: CheckCircle2,
      color: '#1D9E75',
    },
    {
      label: 'Total Auditorías',
      value: consultas.length.toString(),
      icon: ClipboardList,
      color: '#6B7280',
    }
  ];

  // Mostramos solo un resumen de los laboratorios (por ejemplo los 8 más recientes)
  const labs = consultas.slice(0, 8).map(c => {
    const info = getEstadoInfo(c.estado);
    const dateStr = new Date(c.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

    const respCount = c.responsables ? c.responsables.length : 0;
    let respText = 'Sin asignar';
    if (respCount === 1) {
      const cons = consultores.find(u => u.id === c.responsables[0]);
      respText = cons ? `${cons.first_name || cons.username} ${cons.last_name || ''}`.trim() : `Usuario #${c.responsables[0]}`;
    } else if (respCount > 1) {
      respText = `${respCount} consultores asignados`;
    }

    const labStyle = getLabIconAndColor(c.area_nombre);

    return {
      audit: c,
      id: c.id,
      name: c.area_nombre ? c.area_nombre : `Auditoría #${c.id}`,
      auditNumber: `AUD-${c.id.toString().padStart(3, '0')}`,
      lastAudit: dateStr,
      status: info.label,
      statusColor: info.statusColor,
      respText,
      respCount,
      icon: labStyle.icon,
      color: labStyle.color,
    };
  });

  const activities = consultas.slice(0, 5).map(c => {
    const info = getEstadoInfo(c.estado);
    const dateStr = new Date(c.fecha_actualizacion || c.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return {
      lab: c.area_nombre ? `${c.area_nombre} #${c.id}` : `Auditoría #${c.id}`,
      action: `Cambio de estado a: ${info.label}`,
      time: dateStr,
      user: 'Actualización del Sistema',
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
      {/* Page title */}
      <div>
        <h1 className="text-[20px] font-medium text-gray-900">
          Dashboard de laboratorios
        </h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Vista general del sistema
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-6 border border-[#E8E8E8] hover:shadow-md transition-shadow bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[14px] text-gray-600">{kpi.label}</p>
                  <p className="text-[28px] font-semibold mt-2" style={{ color: kpi.color }}>
                    {kpi.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${kpi.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Laboratory cards */}
      <div>
        <h2 className="text-[18px] font-medium text-gray-900 mb-4">
          Laboratorios en Auditoría
        </h2>
        {labs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border border-dashed border-[#E8E8E8] rounded-xl bg-gray-50">
            No existen auditorías registradas actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {labs.map((lab) => {
              const Icon = lab.icon;
              return (
                <Card key={lab.id} className="p-6 border border-[#E8E8E8] hover:border-gray-300 transition-colors bg-white">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center shadow-sm mt-0.5"
                        style={{ backgroundColor: `${lab.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: lab.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold text-[#003087] uppercase tracking-wider">{lab.auditNumber}</span>
                        </div>
                        <h3 className="text-[16px] font-bold text-gray-900 truncate" title={lab.name}>
                          {lab.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[13px] text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Última actualización: <span className="font-medium text-gray-700">{lab.lastAudit}</span>
                      </p>
                      <p className="text-[13px] text-gray-500 flex items-center gap-1.5 truncate" title={lab.respText}>
                        {lab.respCount === 1 ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                        <span className="font-medium text-gray-700 truncate">{lab.respText}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <Badge className={`${lab.statusColor} text-white hover:opacity-90 text-[11px] px-2 py-0.5 border-none shadow-none`}>
                        {lab.status}
                      </Badge>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedAudit(lab.audit)}
                        className="h-7 text-[12px] px-3 bg-[#003087] text-white border-[#003087] shadow-sm"
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent activity */}
      {activities.length > 0 && (
        <div>
          <h2 className="text-[18px] font-medium text-gray-900 mb-4">
            Actividad reciente
          </h2>
          <Card className="border border-[#E8E8E8] bg-white overflow-hidden">
            <div className="divide-y divide-[#E8E8E8]">
              {activities.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-[#F5F5F5] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-gray-900">
                        {activity.lab}
                      </p>
                      <p className="text-[13px] text-gray-600 mt-1">
                        {activity.action}
                      </p>
                      <p className="text-[12px] text-gray-400 mt-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {activity.time} <span className="text-gray-300">|</span> <span className="text-[#003087] font-medium">{activity.user}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <ConsultaDetalleModal
        selectedAudit={selectedAudit}
        onClose={() => setSelectedAudit(null)}
        isAdmin={true}
        consultores={consultores}
      />
    </div>
  );
}
