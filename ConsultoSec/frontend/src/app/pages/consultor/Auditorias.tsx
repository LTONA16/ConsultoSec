import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Calendar, ClipboardCheck, ArrowRight, Wrench, Search, Filter } from 'lucide-react';
import { consultasService, Consulta } from '../../../features/consultas/services/consultasService';
import { useAuth } from '../../../features/auth/AuthContext';

const getEstadoInfo = (estado: string) => {
  switch (estado) {
    case 'agendada': return { label: 'Agendada', badgeColor: 'bg-gray-500', isChecklist: true };
    case 'revision_previa': return { label: 'Revisión Previa', badgeColor: 'bg-[#8B5CF6]', isChecklist: true };
    case 'revision_verificacion': return { label: 'Revisión con Lista de Verificación', badgeColor: 'bg-[#003087]', isChecklist: true };
    case 'mejoras_solicitadas': return { label: 'En Mejoras', badgeColor: 'bg-[#F59E0B]', isChecklist: false };
    case 'ultima_revision': return { label: 'Última Revisión', badgeColor: 'bg-[#8B5CF6]', isChecklist: true };
    case 'finalizada': return { label: 'Finalizada', badgeColor: 'bg-[#1D9E75]', isChecklist: false };
    case 'pendiente': return { label: 'Pendiente', badgeColor: 'bg-red-500', isChecklist: false };
    case 'cancelada': return { label: 'Cancelada', badgeColor: 'bg-gray-800', isChecklist: false };
    default: return { label: estado, badgeColor: 'bg-gray-500', isChecklist: false };
  }
};

export function MisAuditorias() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [auditorias, setAuditorias] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroLab, setFiltroLab] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  useEffect(() => {
    if (token) {
      consultasService.obtenerConsultas(token).then((data) => {
        setAuditorias(data);
        setLoading(false);
      }).catch(err => {
        console.error("Error al cargar auditorías:", err);
        setLoading(false);
      });
    }
  }, [token]);

  // Obtener opciones únicas
  const laboratoriosUnicos = useMemo(() => {
    const labs = new Set(auditorias.map(a => a.area_nombre || 'General'));
    return ['Todos', ...Array.from(labs)];
  }, [auditorias]);
  
  const estadosUnicos = [
    'Todos', 
    'Agendada', 
    'Revisión Previa', 
    'Revisión con Lista de Verificación', 
    'En Mejoras', 
    'Última Revisión', 
    'Finalizada', 
    'Pendiente', 
    'Cancelada'
  ];

  // Aplicar filtros
  const auditoriasFiltradas = auditorias.filter(audit => {
    const labName = audit.area_nombre || 'General';
    
    // Búsqueda por ID o Nombre
    if (searchTerm) {
      const matchId = audit.id.toString() === searchTerm.trim() || `#${audit.id}` === searchTerm.trim();
      const matchName = labName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchId && !matchName) return false;
    }

    // Filtro por Laboratorio
    if (filtroLab !== 'Todos' && labName !== filtroLab) return false;

    // Filtro por Estado
    if (filtroEstado !== 'Todos') {
      const info = getEstadoInfo(audit.estado);
      if (info.label !== filtroEstado) return false;
    }

    return true;
  });

  const handleAccion = (audit: Consulta, isChecklist: boolean) => {
    if (isChecklist) {
      navigate(`/consultor/checklist?id=${audit.id}&lab=${encodeURIComponent(audit.area_nombre || 'General')}`);
    } else {
      alert(`Navegar al seguimiento de ${audit.area_nombre ? `${audit.area_nombre} #${audit.id}` : `Consulta #${audit.id}`}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">Mis Auditorías Asignadas</h1>
        <p className="text-[14px] text-gray-500 mt-1">Selecciona una auditoría pendiente para comenzar o continuar tu trabajo de campo.</p>
      </div>

      {/* Controles de Filtros */}
      <Card className="p-4 border border-[#E8E8E8] bg-white shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar por ID (#1) o nombre del laboratorio..." 
            className="pl-9 h-10 border-[#E8E8E8] bg-gray-50/50 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-4">
          <div className="flex-1 md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select 
              className="w-full h-10 pl-9 pr-4 text-[13px] border border-[#E8E8E8] rounded-md bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent appearance-none"
              value={filtroLab}
              onChange={(e) => setFiltroLab(e.target.value)}
            >
              {laboratoriosUnicos.map((lab, index) => (
                <option key={index} value={lab}>{lab}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select 
              className="w-full h-10 pl-9 pr-4 text-[13px] border border-[#E8E8E8] rounded-md bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent appearance-none"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              {estadosUnicos.map((estado, index) => (
                <option key={index} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {auditoriasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border border-dashed border-[#E8E8E8] rounded-xl bg-gray-50 flex flex-col items-center gap-3">
            <Search className="w-8 h-8 text-gray-300" />
            <p>No se encontraron auditorías con los filtros seleccionados.</p>
            {(searchTerm || filtroLab !== 'Todos' || filtroEstado !== 'Todos') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFiltroLab('Todos');
                  setFiltroEstado('Todos');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : auditoriasFiltradas.map((audit) => {
          const info = getEstadoInfo(audit.estado);
          const fechaFormat = new Date(audit.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

          return (
            <Card key={audit.id} className="p-6 border border-[#E8E8E8] hover:shadow-md transition-shadow bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[18px] font-bold text-gray-900">{audit.area_nombre ? `${audit.area_nombre} #${audit.id}` : `Consulta #${audit.id}`}</h3>
                    <Badge className={`${info.badgeColor} text-white border-none px-2 py-0.5 text-[11px]`}>
                      {info.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-[14px] text-gray-600 font-medium">
                    <span className="flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4 text-gray-400" /> Consultoría #{audit.id}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> Creada: {fechaFormat}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleAccion(audit, info.isChecklist)}
                  className={`gap-2 shadow-sm whitespace-nowrap ${!info.isChecklist
                    ? 'bg-white text-[#F59E0B] border border-[#F59E0B] hover:bg-orange-50'
                    : 'bg-[#003087] hover:bg-[#002366] text-white'
                    }`}
                >
                  {!info.isChecklist ? (
                    <><Wrench className="w-4 h-4" /> Seguimiento / Gantt</>
                  ) : (
                    <><ClipboardCheck className="w-4 h-4" /> Iniciar Checklist <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>

              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}