import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Calendar, ClipboardCheck, ArrowRight, Wrench, Search, Filter, XCircle, AlertTriangle, Eye, Info, Users, Clock as ClockIcon } from 'lucide-react';
import { consultasService, Consulta, Training } from '../../../features/consultas/services/consultasService';
import { useAuth } from '../../../features/auth/AuthContext';
import { toast } from 'sonner';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command';
import { Loader2, X, Check, ChevronsUpDown } from 'lucide-react';
import { AreaLaboratorio, Usuario } from '../../../features/consultas/services/consultasService';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { ConsultaDetalleModal } from '../../../features/consultas/components/ConsultaDetalleModal';

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
  // Form State
  const [areas, setAreas] = useState<AreaLaboratorio[]>([]);
  const [consultores, setConsultores] = useState<Usuario[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [fechaPropuesta, setFechaPropuesta] = useState<string>('');
  const [selectedConsultores, setSelectedConsultores] = useState<Usuario[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [submitting, setSubmitting] = useState(false);



  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroLab, setFiltroLab] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Estado para confirmación de rechazo
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [rechazando, setRechazando] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Consulta | null>(null);

  useEffect(() => {
    if (token) {
      Promise.all([
        consultasService.obtenerConsultas(token),
        consultasService.obtenerCapacitaciones(token),
        consultasService.obtenerAreas(token),
        consultasService.obtenerConsultores(token)
      ]).then(([audData, capData, areasData, consData]) => {
        setAreas(areasData);
        setConsultores(consData);
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
    const consultoresDisponibles = consultores.filter(c => c.role === 'CONSULTOR' && c.is_active);

  const toggleConsultor = (consultor: Usuario) => {
    const exists = selectedConsultores.find(c => c.id === consultor.id);
    if (exists) {
      setSelectedConsultores(selectedConsultores.filter(c => c.id !== consultor.id));
    } else {
      setSelectedConsultores([...selectedConsultores, consultor]);
    }
  };

  const handleRemoveConsultor = (id: number) => {
    setSelectedConsultores(selectedConsultores.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArea || !fechaPropuesta || selectedConsultores.length === 0) {
      toast.warning("Campos incompletos", {
        description: "Por favor selecciona el área, la fecha y al menos un consultor."
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload: Partial<Consulta> = {
        area_laboratorio: parseInt(selectedArea),
        fecha_finalizacion_propuesta: `${fechaPropuesta}T12:00:00`,
        responsables: selectedConsultores.map(c => c.id),
        estado: 'agendada'
      };
      const nueva = await consultasService.crearConsulta(token!, payload);
      setAuditorias([nueva, ...auditorias]);
      toast.success("Solicitud agendada");
      setSelectedArea('');
      setFechaPropuesta('');
      setSelectedConsultores([]);
    } catch (error) {
      toast.error("Error al crear la solicitud");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

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
      setSelectedAudit(null);
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
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">Mis Auditorías Asignadas</h1>
        <p className="text-[14px] text-gray-500 mt-1">Selecciona una auditoría pendiente para comenzar o continuar tu trabajo de campo.</p>
      </div>

      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <Card className="p-6 border border-[#E8E8E8] sticky top-8 bg-white shadow-sm">
            <h2 className="text-[16px] font-bold text-[#003087] mb-6 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Nueva Solicitud
            </h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="lab">Laboratorio a auditar</Label>
                <Select onValueChange={setSelectedArea} value={selectedArea}>
                  <SelectTrigger id="lab">
                    <SelectValue placeholder="Seleccionar laboratorio" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area.id} value={area.id.toString()}>{area.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha propuesta de finalización</Label>
                <div className="relative">
                  <Input
                    id="fecha"
                    type="date"
                    className="pl-10"
                    value={fechaPropuesta}
                    onChange={(e) => setFechaPropuesta(e.target.value)}
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Asignar consultores</Label>
                <div className="space-y-2">
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full justify-between font-normal text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      >
                        {selectedConsultores.length > 0
                          ? `${selectedConsultores.length} consultor(es) seleccionado(s)`
                          : "Seleccionar consultores..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] xl:w-[350px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar por nombre..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No se encontraron consultores.</CommandEmpty>
                          <CommandGroup>
                            {consultoresDisponibles.map((cUser) => {
                              const isSelected = selectedConsultores.some(c => c.id === cUser.id);
                              return (
                                <CommandItem
                                  key={cUser.id}
                                  value={`${cUser.first_name} ${cUser.last_name} ${cUser.username}`}
                                  onSelect={() => toggleConsultor(cUser)}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 text-[#003087] transition-opacity ${isSelected ? "opacity-100" : "opacity-0"
                                      }`}
                                  />
                                  <span>
                                    {cUser.first_name || cUser.username} {cUser.last_name}
                                  </span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedConsultores.map(consultor => (
                      <Badge key={consultor.id} variant="secondary" className="bg-blue-50 text-[#003087] border-blue-100 flex items-center gap-1.5 py-1">
                        {consultor.first_name || consultor.username}
                        <button
                          type="button"
                          onClick={() => handleRemoveConsultor(consultor.id)}
                          className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#003087] hover:bg-[#002366] text-white py-6 shadow-md transition-all active:scale-[0.98]"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Agendar Visita"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
        <div className="xl:col-span-2 space-y-4">

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
          const dateToShow = audit.fecha_finalizacion_propuesta
            ? new Date(audit.fecha_finalizacion_propuesta).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
            : audit.fecha_creacion
            ? new Date(audit.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
            : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
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
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> Fecha: {dateToShow}</span>
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
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 gap-2 font-semibold"
                      onClick={() => setSelectedAudit(audit)}
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                      Ver detalles
                    </Button>
                    {audit.estado !== 'finalizada' && audit.estado !== 'cancelada' && (
                      <Button
                        onClick={() => handleAccion(audit, info.isChecklist)}
                        className={`gap-2 shadow-sm whitespace-nowrap font-semibold ${!info.isChecklist
                          ? 'bg-white text-[#003087] border border-[#003087] hover:bg-blue-50'
                          : 'bg-[#003087] hover:bg-[#002366] text-white'
                          }`}
                      >
                        {!info.isChecklist ? (
                          <><Wrench className="w-4 h-4" /> Seguimiento / Gantt</>
                        ) : (
                          <><ClipboardCheck className="w-4 h-4" /> Iniciar Checklist <ArrowRight className="w-4 h-4" /></>
                        )}
                      </Button>
                    )}
                  </div>
                )}

              </div>
            </Card>
          );
        })}
      </div>
      </div>
      </div>
      {/* Modal de Detalles */}
      <ConsultaDetalleModal 
        selectedAudit={selectedAudit} 
        onClose={() => setSelectedAudit(null)} 
        onAction={(audit, isChecklist) => {
          setSelectedAudit(null);
          handleAccion(audit, isChecklist);
        }}
        onDeleteRequest={(id) => setConfirmandoId(id)}
        confirmandoId={confirmandoId}
        rechazando={rechazando}
        onConfirmDelete={handleRechazar}
        onCancelDelete={() => setConfirmandoId(null)}
      />
    </div>
  );
}