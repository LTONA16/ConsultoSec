import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AlertCircle, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

export function DashboardAdmin() {
  const kpis = [
    {
      label: 'Auditorías activas',
      value: '12',
      icon: Clock,
      color: '#003087',
    },
    {
      label: 'Condiciones inseguras detectadas',
      value: '47',
      icon: AlertCircle,
      color: '#E24B4A',
    },
    {
      label: 'Propuestas aprobadas',
      value: '35',
      icon: CheckCircle2,
      color: '#1D9E75',
    },
    {
      label: 'Porcentaje de cumplimiento promedio',
      value: '87%',
      icon: TrendingUp,
      color: '#BA7517',
    },
  ];

  const labs = [
    {
      name: 'Manufactura Avanzada',
      lastAudit: '12 Abr 2026',
      status: 'En curso',
      statusColor: 'bg-[#003087]',
    },
    {
      name: 'Eléctrica',
      lastAudit: '05 Abr 2026',
      status: 'Finalizado',
      statusColor: 'bg-[#1D9E75]',
    },
    {
      name: 'Mecatrónica Básica',
      lastAudit: '20 Mar 2026',
      status: 'Agendado',
      statusColor: 'bg-gray-500',
    },
    {
      name: 'Mecatrónica Avanzada',
      lastAudit: '15 Mar 2026',
      status: 'En curso',
      statusColor: 'bg-[#003087]',
    },
  ];

  const activities = [
    {
      lab: 'Manufactura Avanzada',
      action: 'Checklist completado',
      time: 'Hace 2 horas',
      user: 'Juan Pérez',
    },
    {
      lab: 'Eléctrica',
      action: 'Propuesta aprobada',
      time: 'Hace 5 horas',
      user: 'Maestra Viridiana',
    },
    {
      lab: 'Mecatrónica Básica',
      action: 'Auditoría agendada',
      time: 'Hace 1 día',
      user: 'Maestra Viridiana',
    },
    {
      lab: 'Mecatrónica Avanzada',
      action: 'Capacitación registrada',
      time: 'Hace 2 días',
      user: 'María González',
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-[20px] font-medium text-gray-900">
          Dashboard de laboratorios
        </h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Vista general del sistema de consultoría
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-6 border border-[#E8E8E8]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[14px] text-gray-600">{kpi.label}</p>
                  <p className="text-[28px] font-semibold mt-2" style={{ color: kpi.color }}>
                    {kpi.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
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
          Laboratorios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {labs.map((lab) => (
            <Card key={lab.name} className="p-6 border border-[#E8E8E8]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-[16px] font-medium text-gray-900">
                    {lab.name}
                  </h3>
                  <p className="text-[14px] text-gray-500 mt-1">
                    Última auditoría: {lab.lastAudit}
                  </p>
                </div>
                <Badge className={`${lab.statusColor} text-white hover:${lab.statusColor} text-[12px]`}>
                  {lab.status}
                </Badge>
                <Button
                  variant="outline"
                  className="w-full text-[14px] border-[#E8E8E8] hover:bg-[#F5F5F5]"
                >
                  Ver detalle
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-[18px] font-medium text-gray-900 mb-4">
          Actividad reciente
        </h2>
        <Card className="border border-[#E8E8E8]">
          <div className="divide-y divide-[#E8E8E8]">
            {activities.map((activity, index) => (
              <div key={index} className="p-4 hover:bg-[#F5F5F5] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-gray-900">
                      {activity.lab}
                    </p>
                    <p className="text-[14px] text-gray-600 mt-1">
                      {activity.action}
                    </p>
                    <p className="text-[12px] text-gray-500 mt-1">
                      {activity.user} · {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
