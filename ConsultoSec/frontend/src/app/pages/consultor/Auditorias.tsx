import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Calendar, ClipboardCheck, ArrowRight, Wrench, Search, Filter, XCircle, AlertTriangle } from 'lucide-react';
import { consultasService, Consulta, Training } from '../../../features/consultas/services/consultasService';
import { useAuth } from '../../../features/auth/AuthContext';
import { toast } from 'sonner';

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
  const { token, user } = useAuth();
  const [auditorias, setAuditorias] = useState<Consulta[]>([]);
  const [capacitaciones, setCapacitaciones] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroLab, setFiltroLab] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Estado para confirmación de rechazo
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [rechazando, setRechazando] = useState(false);

  useEffect(() => {
    if (token) {
      Promise.all([
        consultasService.obtenerConsultas(token),
        consultasService.obtenerCapacitaciones(token)
      ]).then(([audData, capData]) => {
        setAuditorias(audData);
        setCapacitaciones(capData);
        setLoading(false);
      }).catch(err => {
        console.error("Error al cargar datos:", err);
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
      // Validar si el consultor ha asistido a la capacitación
      if (user) {
        // Encontrar capacitaciones relacionadas al laboratorio de esta auditoría
        const capsRelacionadas = capacitaciones.filter(c =>
          (audit.area_laboratorio && c.laboratorios.includes(audit.area_laboratorio)) ||
          c.consultas.includes(audit.id)
        );

        // Validar si el usuario está en los asistentes de alguna de las capacitaciones relacionadas
        const haAsistido = capsRelacionadas.some(c => c.asistentes.includes(user.id));

        if (!haAsistido && capsRelacionadas.length > 0) {
          toast.error("Capacitación requerida", {
            description: "No has asistido a la capacitación necesaria para auditar este laboratorio.",
            position: 'top-right'
          });
          return;
        } else if (capsRelacionadas.length === 0) {
          // Si no hay capacitaciones relacionadas, podríamos permitirlo o bloquearlo. 
          // Según el requerimiento "deberias de haber asistido a la capacitación seleccionada". 
          // Si no hay capacitaciones asumo que no es estricto, o el admin olvidó, pero por ahora lo dejamos pasar o bloqueamos.
          // Para no bloquear completamente flujos huérfanos, lo dejamos pasar si no hay caps.
        }
      }

      navigate(`/consultor/checklist?id=${audit.id}&lab=${encodeURIComponent(audit.area_nombre || 'General')}`);
    } else {
      navigate(`/consultor/seguimiento?id=${audit.id}&lab=${encodeURIComponent(audit.area_nombre || 'General')}`);
    }
  };

  const handleRechazar = async (id: number) => {
    if (!token) return;
    setRechazando(true);
    try {
      await consultasService.eliminarConsulta(token, id);
      setAuditorias(prev => prev.filter(a => a.id !== id));
      setConfirmandoId(null);
      toast.success("Solicitud rechazada", {
        description: "La auditoría ha sido eliminada de tu lista.",
        position: 'top-right',
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al rechazar", {
        description: "No se pudo rechazar la solicitud. Intenta de nuevo.",
        position: 'top-right',
      });
    } finally {
      setRechazando(false);
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
          const isConfirming = confirmandoId === audit.id;

          return (
            <Card key={audit.id} className={`p-6 border transition-all bg-white ${isConfirming ? 'border-red-300 shadow-md shadow-red-50' : 'border-[#E8E8E8] hover:shadow-md'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[18px] font-bold text-gray-900">{audit.area_nombre ? `${audit.area_nombre} #${audit.id}` : `Auditoría #${audit.id}`}</h3>
                    <Badge className={`${info.badgeColor} text-white border-none px-2 py-0.5 text-[11px]`}>
                      {info.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-[14px] text-gray-600 font-medium">
                    <span className="flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4 text-gray-400" /> Auditoría #{audit.id}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> Creada: {fechaFormat}</span>
                  </div>

                  {/* Confirmación inline */}
                  {isConfirming && (
                    <div className="flex items-center gap-3 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-[13px] text-red-700 font-medium flex-1">
                        ¿Seguro que quieres rechazar esta auditoría? Esta acción no se puede deshacer.
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-600 border-gray-300 h-8 text-xs"
                          onClick={() => setConfirmandoId(null)}
                          disabled={rechazando}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs gap-1"
                          onClick={() => handleRechazar(audit.id)}
                          disabled={rechazando}
                        >
                          {rechazando ? (
                            <span className="animate-spin rounded-full h-3 w-3 border-b border-white inline-block" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          Confirmar rechazo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {!isConfirming && (
                  <div className="flex gap-3 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 gap-1.5"
                      onClick={() => setConfirmandoId(audit.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </Button>
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
                )}

              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}