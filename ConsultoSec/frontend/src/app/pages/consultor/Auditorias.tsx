import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar, Building2, ClipboardCheck, ArrowRight, Wrench } from 'lucide-react';

export function MisAuditorias() {
  const navigate = useNavigate();

  // Simulamos las auditorías asignadas al consultor con los estados del flujo estructurado
  const [auditorias] = useState([
    { id: 'AUD-2026-004', lab: 'Manufactura Avanzada', fecha: '18 Abr 2026', estado: 'Agendado' },
    { id: 'AUD-2026-005', lab: 'Eléctrica', fecha: '20 Abr 2026', estado: 'Revisión con Lista de Verificación' },
    { id: 'AUD-2026-006', lab: 'Mecatrónica Básica', fecha: '10 Abr 2026', estado: 'En Mejoras' },
  ]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Agendado': return 'bg-gray-500';
      case 'Revisión con Lista de Verificación': return 'bg-[#003087]';
      case 'En Mejoras': return 'bg-[#F59E0B]';
      default: return 'bg-gray-500';
    }
  };

  const handleAccion = (audit: any) => {
    // Si está agendada o en revisión, lo mandamos al checklist, pasándole el laboratorio por la URL oculta
    if (audit.estado === 'Agendado' || audit.estado === 'Revisión con Lista de Verificación') {
      navigate(`/consultor/checklist?id=${audit.id}&lab=${encodeURIComponent(audit.lab)}`);
    } else {
      // Para otros estados (como "En Mejoras"), lo podríamos mandar al Gantt
      alert(`Navegar al seguimiento de ${audit.lab}`);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">Mis Auditorías Asignadas</h1>
        <p className="text-[14px] text-gray-500 mt-1">Selecciona una auditoría pendiente para comenzar o continuar tu trabajo de campo.</p>
      </div>

      <div className="grid gap-4">
        {auditorias.map((audit) => (
          <Card key={audit.id} className="p-6 border border-[#E8E8E8] hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-[18px] font-bold text-gray-900">{audit.lab}</h3>
                  <Badge className={`${getEstadoColor(audit.estado)} text-white border-none`}>
                    {audit.estado}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-[14px] text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4 text-gray-400" /> {audit.id}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> {audit.fecha}</span>
                </div>
              </div>

              <Button 
                onClick={() => handleAccion(audit)}
                className={`gap-2 shadow-sm ${
                  audit.estado === 'En Mejoras' 
                  ? 'bg-white text-[#F59E0B] border border-[#F59E0B] hover:bg-orange-50' 
                  : 'bg-[#003087] hover:bg-[#002366] text-white'
                }`}
              >
                {audit.estado === 'En Mejoras' ? (
                  <><Wrench className="w-4 h-4" /> Actualizar Gantt</>
                ) : (
                  <><ClipboardCheck className="w-4 h-4" /> Iniciar Checklist <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>

            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}