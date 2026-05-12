import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Camera,
  Save,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  ClipboardCheck,
  PauseCircle,
  Plus,
  Trash2,
  LayoutGrid,
  PlusCircle,
  Edit3,
  HelpCircle,
  Send,
  Search,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { consultasService, Consulta, ChecklistItem, RequisitoLaboratorio } from '../../../features/consultas/services/consultasService';
import { useAuth } from '../../../features/auth/AuthContext';

export function Checklist() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const labFromUrl = searchParams.get('lab');
  const idFromUrl = searchParams.get('id');

  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const [isFinalizarModalOpen, setIsFinalizarModalOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNuevoReqModalOpen, setIsNuevoReqModalOpen] = useState(false);
  const [nuevoReqCategoria, setNuevoReqCategoria] = useState('');
  const [nuevoReqNuevaCategoria, setNuevoReqNuevaCategoria] = useState('');
  const [nuevoReqTexto, setNuevoReqTexto] = useState('');
  const [nuevoReqNorma, setNuevoReqNorma] = useState('');
  const [isSavingNuevoReq, setIsSavingNuevoReq] = useState(false);

  const [bancoRequisitos, setBancoRequisitos] = useState<RequisitoLaboratorio[]>([]);
  const [bancoSearchTerm, setBancoSearchTerm] = useState('');
  const [isBancoLoading, setIsBancoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('banco');
  
  const [imagenModal, setImagenModal] = useState<{ isOpen: boolean; url: string; itemId: number | null }>({
    isOpen: false,
    url: '',
    itemId: null
  });
  const [isUploading, setIsUploading] = useState<number | null>(null);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (token && idFromUrl) {
      consultasService.obtenerConsulta(token, parseInt(idFromUrl))
        .then(data => {
          setConsulta(data);
          setLoading(false);
          // If status is agendada or revision_previa, mark it internally as revision_verificacion indicating we started the checklist
          if (data.estado === 'agendada' || data.estado === 'revision_previa') {
            consultasService.actualizarConsulta(token, data.id, { estado: 'revision_verificacion' });
          }
        })
        .catch(err => {
          console.error("Error al cargar la consulta:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token, idFromUrl]);

  // Cargar banco de requisitos cuando se abre el modal y la pestaña es "banco"
  useEffect(() => {
    if (isNuevoReqModalOpen && activeTab === 'banco' && consulta?.area_laboratorio && token) {
      if (bancoRequisitos.length > 0) return; // Ya se cargaron
      setIsBancoLoading(true);
      consultasService.obtenerRequisitosLaboratorio(token, consulta.area_laboratorio)
        .then(data => {
          // Filtrar los que ya están en el checklist actual
          const existentes = new Set(consulta.items_checklist.map(i => i.requisito.toLowerCase().trim()));
          const disponibles = data.filter(r => !existentes.has(r.pregunta.toLowerCase().trim()));
          setBancoRequisitos(disponibles);
        })
        .catch(err => {
          console.error("Error cargando banco de requisitos:", err);
          toast.error("Error al cargar requisitos predefinidos");
        })
        .finally(() => setIsBancoLoading(false));
    }
  }, [isNuevoReqModalOpen, activeTab, consulta, token, bancoRequisitos.length]);

  // Filtrado de items
  const itemsFiltrados = [
    ...(consulta?.items_checklist || [])
  ].filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const texto = item.requisito || item.pregunta || '';
    const norma = item.normativa_aplicable || '';
    const cat = item.categoria || '';

    return (
      texto.toLowerCase().includes(term) ||
      norma.toLowerCase().includes(term) ||
      cat.toLowerCase().includes(term)
    );
  });

  // Agrupación por categoría (usando los items filtrados)
  const secciones = itemsFiltrados.reduce((acc: any[], curr) => {
    const existing = acc.find(c => c.categoria === curr.categoria);
    if (existing) {
      existing.preguntas.push(curr);
    } else {
      acc.push({ categoria: curr.categoria, preguntas: [curr] });
    }
    return acc;
  }, []);

  // Obtener categorías únicas para el dropdown
  const categoriasUnicas = Array.from(new Set((consulta?.items_checklist || []).map(i => i.categoria).filter(Boolean)));

  const handleGuardarNuevoRequisito = async () => {
    if (!token || !consulta) return;

    const categoriaFinal = nuevoReqCategoria === 'otra' ? nuevoReqNuevaCategoria.trim() : nuevoReqCategoria;

    if (!categoriaFinal || !nuevoReqTexto.trim()) {
      toast.warning('Campos incompletos', {
        description: 'Debes seleccionar una categoría y escribir el requisito.'
      });
      return;
    }

    setIsSavingNuevoReq(true);
    try {
      const payload = {
        consulta: consulta.id,
        categoria: categoriaFinal,
        requisito: nuevoReqTexto.trim(),
        normativa_aplicable: nuevoReqNorma.trim() || null,
        cumple: 'no_evaluado' as const,
        area: consulta.area_nombre || '',
        observacion: '',
        mejora: '',
        comentarios: ''
      };

      const nuevoItem = await consultasService.crearChecklistItem(token, payload);

      setConsulta({
        ...consulta,
        items_checklist: [...consulta.items_checklist, nuevoItem]
      });

      toast.success('Requisito agregado con éxito');

      setNuevoReqCategoria('');
      setNuevoReqNuevaCategoria('');
      setNuevoReqTexto('');
      setNuevoReqNorma('');
      setIsNuevoReqModalOpen(false);
      setActiveTab('banco');
    } catch (error) {
      console.error("Error al crear el requisito", error);
      toast.error('Hubo un error al guardar el nuevo requisito');
    } finally {
      setIsSavingNuevoReq(false);
    }
  };

  const handleAgregarDelBanco = async (req: RequisitoLaboratorio) => {
    if (!token || !consulta) return;
    setIsSavingNuevoReq(true);
    try {
      const payload = {
        consulta: consulta.id,
        categoria: req.categoria,
        requisito: req.pregunta,
        normativa_aplicable: req.normativa_aplicable,
        cumple: 'no_evaluado' as const,
        area: consulta.area_nombre || '',
        observacion: '',
        mejora: '',
        comentarios: ''
      };

      const nuevoItem = await consultasService.crearChecklistItem(token, payload);

      setConsulta({
        ...consulta,
        items_checklist: [...consulta.items_checklist, nuevoItem]
      });

      toast.success('Requisito agregado del banco');
      setBancoRequisitos(prev => prev.filter(r => r.id !== req.id));
      setIsNuevoReqModalOpen(false);
      setActiveTab('banco');
    } catch (error) {
      console.error("Error al agregar del banco", error);
      toast.error('Hubo un error al guardar el requisito');
    } finally {
      setIsSavingNuevoReq(false);
    }
  };

  const handleRespuesta = (item: ChecklistItem, valor: 'si' | 'no' | 'parcial' | 'no_evaluado') => {
    if (!consulta || !token) return;

    // Optimistic update
    const updatedItems = consulta.items_checklist.map(i =>
      i.id === item.id ? { ...i, cumple: valor } : i
    );
    setConsulta({ ...consulta, items_checklist: updatedItems });

    // API update
    consultasService.actualizarChecklistItem(token, item.id, { cumple: valor })
      .then(() => {
        toast('Actualizado ✓', {
          position: 'top-right',
          duration: 1500,
          style: { fontSize: '12px', padding: '6px 12px', minHeight: 'auto', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#4B5563', borderRadius: '8px', width: 'auto', marginLeft: 'auto', marginTop: '6em' }
        });
      })
      .catch(err => console.error("Error updating item", err));
  };

  const handleUploadImage = async (itemId: number, file: File) => {
    if (!token || !consulta) return;
    setIsUploading(itemId);
    try {
      const updatedItem = await consultasService.subirImagenChecklist(token, itemId, file);
      setConsulta(prev => prev ? ({
        ...prev,
        items_checklist: prev.items_checklist.map(i => i.id === itemId ? updatedItem : i)
      }) : prev);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(null);
    }
  };

  const handleDeleteImage = async (itemId: number) => {
    if (!token || !consulta) return;
    setIsUploading(itemId);
    try {
      const updatedItem = await consultasService.subirImagenChecklist(token, itemId, null);
      setConsulta(prev => prev ? ({
        ...prev,
        items_checklist: prev.items_checklist.map(i => i.id === itemId ? updatedItem : i)
      }) : prev);
      toast.success('Imagen eliminada correctamente');
      setImagenModal({ isOpen: false, url: '', itemId: null });
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar la imagen');
    } finally {
      setIsUploading(null);
    }
  };

  const handleNota = (item: ChecklistItem, observacion: string) => {
    if (!consulta || !token) return;

    // Optimistic update
    const updatedItems = consulta.items_checklist.map(i =>
      i.id === item.id ? { ...i, observacion } : i
    );
    setConsulta({ ...consulta, items_checklist: updatedItems });

    // Debounce API update para notas
    if (debounceTimers.current[item.id]) {
      clearTimeout(debounceTimers.current[item.id]);
    }

    debounceTimers.current[item.id] = setTimeout(() => {
      consultasService.actualizarChecklistItem(token, item.id, { observacion })
        .then(() => {
          toast('Nota insertada ✓', {
            position: 'top-right',
            duration: 1500,
            style: { fontSize: '12px', padding: '6px 12px', minHeight: 'auto', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#4B5563', borderRadius: '8px', width: 'auto', marginLeft: 'auto', marginTop: '6em' }
          });
        })
        .catch(err => console.error("Error updating nota", err));
    }, 1000);
  };

  const handleFinalizar = async () => {
    if (!token || !consulta) return;
    setIsFinishing(true);

    // --- SOLUCIÓN AL BUCLE: Lógica condicional de estados ---
    // Si la auditoría ya viene de regreso (Última Revisión), el destino final es 'finalizada'.
    // Si es la primera vez que se hace el checklist, el destino es 'mejoras_solicitadas'.
    const nuevoEstado = consulta.estado === 'ultima_revision'
      ? 'finalizada'
      : 'mejoras_solicitadas';

    try {
      await consultasService.actualizarConsulta(token, consulta.id, { estado: nuevoEstado });

      // Opcional: Mostramos un mensaje diferente dependiendo de lo que haya pasado
      const mensajeExito = nuevoEstado === 'finalizada'
        ? 'Auditoría concluida definitivamente'
        : 'Auditoría finalizada con éxito (Etapa de Mejoras)';

      toast.success(mensajeExito, { position: 'top-right', duration: 3000, style: { marginTop: '6em' } });
      navigate('/consultor/auditorias');
    } catch (error) {
      console.error("Error al finalizar la auditoría", error);
      toast.error('Hubo un error al intentar finalizar la auditoría', { position: 'top-right', duration: 3000, style: { marginTop: '6em' } });
    } finally {
      setIsFinishing(false);
      setIsFinalizarModalOpen(false);
    }
  };

  const handleGuardarProgreso = async () => {
    if (!token || !consulta) return;
    setIsSavingInProgress(true);

    try {
      // Force sync all checklist items before navigating away to avoid aborted requests
      await Promise.all(
        consulta.items_checklist.map(item =>
          consultasService.actualizarChecklistItem(token, item.id, {
            cumple: item.cumple,
            observacion: item.observacion
          })
        )
      );
      toast.success('Progreso de la auditoría guardado', { position: 'top-right', duration: 3000, style: { marginTop: '6em' } });
      navigate('/consultor/auditorias');
    } catch (error) {
      console.error("Error al guardar el progreso", error);
      toast.error('Error al guardar el progreso', { position: 'top-right', duration: 3000, style: { marginTop: '6em' } });
    } finally {
      setIsSavingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087]"></div>
      </div>
    );
  }

  if (!labFromUrl || !idFromUrl || !consulta) {
    return (
      <div className="p-8 max-w-3xl mx-auto mt-20 text-center">
        <Card className="p-12 border-dashed border-2 border-gray-200 bg-white">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-[20px] font-bold text-gray-900">Acceso Restringido o No Encontrado</h2>
          <p className="text-[15px] text-gray-500 mt-2 mb-8">
            Debes seleccionar una auditoría válida y asignada desde tu panel para cargar el checklist.
          </p>
          <Button onClick={() => navigate('/consultor/auditorias')} className="bg-[#003087] text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Mis Auditorías
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header informativo renovado */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-[#E8E8E8] shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-[#003087]" />
            </div>
            <h1 className="text-[22px] font-bold text-gray-900">Checklist de Auditoría</h1>
          </div>
          <p className="text-[14px] text-gray-500 mt-2">
            Laboratorio: <strong className="text-gray-900">{consulta.area_nombre || labFromUrl}</strong>
            <span className="mx-3 text-gray-300">|</span>
            Folio: <strong className="text-[#003087]">{idFromUrl}</strong>
          </p>
        </div>

        {/* Buscador Integrado */}
        <div className="w-full lg:w-80 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <LayoutGrid className="w-4 h-4 text-gray-400 group-focus-within:text-[#003087] transition-colors" />
          </div>
          <Input
            placeholder="Buscar por pregunta o categoría..."
            className="pl-10 h-11 border-[#E8E8E8] bg-gray-50/50 focus:bg-white transition-all rounded-xl text-[14px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-10 pb-24">
        {secciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500 border border-dashed rounded-lg bg-white">
            No hay requisitos configurados para este checklist.
            Comunícate con el administrador.
          </div>
        ) : (
          secciones.map((seccion, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-[16px] font-bold text-[#003087] border-b border-[#E8E8E8] pb-2 uppercase tracking-wide">
                {seccion.categoria || 'General'}
              </h2>

              <div className="grid gap-6">
                {seccion.preguntas.map((q: ChecklistItem) => (
                  <Card key={q.id} className="p-6 border border-[#E8E8E8] bg-white">
                    <div className="space-y-6">
                      {/* Pregunta y Botones */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        {(q as any).requisito ? (
                          <>
                            <p className="text-[15px] text-gray-800 font-medium flex-1 pt-1">
                              {q.requisito}
                              {q.normativa_aplicable && (
                                <span className="block mt-1 text-[12px] text-gray-500 font-normal">
                                  Ref: {q.normativa_aplicable}
                                </span>
                              )}
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button
                                  onClick={() => handleRespuesta(q, 'si')}
                                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${q.cumple === 'si' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  <CheckCircle2 className="w-4 h-4" /> CUMPLE
                                </button>
                                <button
                                  onClick={() => handleRespuesta(q, 'parcial')}
                                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${q.cumple === 'parcial' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  <AlertCircle className="w-4 h-4" /> PARCIAL
                                </button>
                                <button
                                  onClick={() => handleRespuesta(q, 'no')}
                                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${q.cumple === 'no' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  <XCircle className="w-4 h-4" /> NO CUMPLE
                                </button>
                                <button
                                  title="No Evaluado"
                                  onClick={() => handleRespuesta(q, 'no_evaluado')}
                                  className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${q.cumple === 'no_evaluado' ? 'bg-gray-200 text-gray-600 shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                  <HelpCircle className="w-4 h-4" />
                                </button>
                              </div>

                              <input 
                                type="file" 
                                accept="image/*" 
                                hidden 
                                ref={el => {
                                  if (el) fileInputRefs.current[q.id] = el;
                                }} 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleUploadImage(q.id, e.target.files[0]);
                                    // Reset input so the same file can be selected again if needed
                                    e.target.value = '';
                                  }
                                }} 
                              />
                              {q.imagen ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-10 border-[#003087] bg-blue-50 text-[#003087] gap-2 hover:bg-blue-100"
                                  onClick={() => setImagenModal({ isOpen: true, url: q.imagen as string, itemId: q.id })}
                                >
                                  <Camera className="w-4 h-4" />
                                  Ver Foto
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-10 border-[#E8E8E8] gap-2"
                                  onClick={() => fileInputRefs.current[q.id]?.click()}
                                  disabled={isUploading === q.id}
                                >
                                  <Camera className="w-4 h-4 text-gray-400" />
                                  {isUploading === q.id ? 'Subiendo...' : 'Foto'}
                                </Button>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-[15px] text-gray-800 font-medium flex-1 pt-1">{(q as any).pregunta}</p>
                        )}
                      </div>

                      {/* Sección de Notas */}
                      <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100 space-y-2">
                        <Label className="text-[12px] flex items-center gap-2 text-gray-600">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Observaciones y notas técnicas
                        </Label>
                        <Textarea
                          placeholder="Escribe aquí los detalles del hallazgo..."
                          className="bg-white border-[#E8E8E8] text-[13px] resize-none w-full break-all"
                          rows={2}
                          value={q.observacion || ''}
                          maxLength={128}
                          onChange={(e) => handleNota(q, e.target.value)}
                        />
                        <div className="flex justify-end">
                          <span className={`text-[10px] font-medium ${(q.observacion || '').length >= 120 ? 'text-red-500' : 'text-gray-400'}`}>
                            {(q.observacion || '').length}/128
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Panel Inferior */}
        <div className="pt-6 flex justify-center">
          <Button
            onClick={() => setIsNuevoReqModalOpen(true)}
            className="bg-white border-2 border-dashed border-[#003087] text-[#003087] hover:bg-blue-50 px-8 py-6 rounded-xl font-bold gap-3"
          >
            <PlusCircle className="w-5 h-5" />
            Agregar nuevo requisito
          </Button>
        </div>

        {/* Botones Flotantes */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 w-48 lg:w-56">
          <Button
            onClick={handleGuardarProgreso}
            disabled={isSavingInProgress}
            className="bg-white border border-[#E8E8E8] text-gray-700 hover:bg-gray-50 hover:text-[#003087] shadow-xl px-8 py-7 rounded-2xl gap-3 font-bold transition-all active:scale-95"
          >
            {isSavingInProgress ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-[#003087] rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5 text-gray-500" />
            )}
            Guardar Progreso
          </Button>

          <Button
            onClick={() => setIsFinalizarModalOpen(true)}
            className="bg-[#003087] hover:bg-[#002366] text-white shadow-xl px-8 py-7 rounded-2xl gap-3 font-bold transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
            Finalizar Auditoría
          </Button>
        </div>
      </div>

      <Dialog open={isFinalizarModalOpen} onOpenChange={setIsFinalizarModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Confirmar Finalización</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas dar por concluida esta auditoría?
              Se notificará al sistema y el checklist pasará a la etapa de resolución de mejoras.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsFinalizarModalOpen(false)}
              disabled={isFinishing}
            >
              Regresar
            </Button>
            <Button
              className="bg-[#003087] hover:bg-[#002266] text-white"
              onClick={handleFinalizar}
              disabled={isFinishing}
            >
              {isFinishing ? 'Cargando...' : 'Sí, finalizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nuevo Requisito */}
      <Dialog open={isNuevoReqModalOpen} onOpenChange={(open) => {
        setIsNuevoReqModalOpen(open);
        if (!open) setActiveTab('banco');
      }}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle>Agregar nuevo requisito</DialogTitle>
              <DialogDescription>
                Añade un requisito al checklist de esta auditoría.
              </DialogDescription>
            </DialogHeader>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="banco">Banco de Requisitos</TabsTrigger>
                <TabsTrigger value="personalizado">Personalizado</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="personalizado" className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={nuevoReqCategoria} onValueChange={setNuevoReqCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasUnicas.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="otra" className="text-[#003087] font-medium">+ Nueva categoría</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {nuevoReqCategoria === 'otra' && (
                <div className="space-y-2">
                  <Label>Nombre de la nueva categoría *</Label>
                  <Input
                    placeholder="Ej: Seguridad Informática"
                    value={nuevoReqNuevaCategoria}
                    onChange={(e) => setNuevoReqNuevaCategoria(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Descripción del requisito *</Label>
                <Textarea
                  placeholder="Describe el requisito a evaluar..."
                  className="resize-none h-24"
                  value={nuevoReqTexto}
                  onChange={(e) => setNuevoReqTexto(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Normativa aplicable (NOM) <span className="text-gray-400 font-normal">(Opcional)</span></Label>
                <Input
                  placeholder="Ej: NOM-001-STPS-2008"
                  value={nuevoReqNorma}
                  onChange={(e) => setNuevoReqNorma(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 pb-2">
                <Button variant="outline" onClick={() => setIsNuevoReqModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-[#003087] hover:bg-[#002266] text-white"
                  onClick={handleGuardarNuevoRequisito}
                  disabled={isSavingNuevoReq}
                >
                  {isSavingNuevoReq ? 'Guardando...' : 'Guardar requisito'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="banco" className="flex-1 flex flex-col p-6 pt-2 overflow-hidden h-[400px]">
              <div className="relative mb-4 mt-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descripción o norma..."
                  className="pl-9"
                  value={bancoSearchTerm}
                  onChange={(e) => setBancoSearchTerm(e.target.value)}
                />
              </div>

              {isBancoLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087]"></div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto border rounded-md p-2 min-h-0">
                  <div className="space-y-2">
                    {bancoRequisitos
                      .filter(r =>
                        r.pregunta.toLowerCase().includes(bancoSearchTerm.toLowerCase()) ||
                        (r.normativa_aplicable || '').toLowerCase().includes(bancoSearchTerm.toLowerCase())
                      )
                      .map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                          <div className="flex-1 pr-4">
                            <p className="text-[13px] font-medium text-gray-800">{req.pregunta}</p>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              <span className="text-[10px] bg-blue-50 text-[#003087] px-2 py-0.5 rounded-full font-semibold">{req.categoria}</span>
                              {req.normativa_aplicable && (
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{req.normativa_aplicable}</span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAgregarDelBanco(req)}
                            disabled={isSavingNuevoReq}
                            className="shrink-0 h-8 text-[#003087] border-[#003087] hover:bg-[#003087] hover:text-white transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      ))}
                    {bancoRequisitos.filter(r =>
                      r.pregunta.toLowerCase().includes(bancoSearchTerm.toLowerCase()) ||
                      (r.normativa_aplicable || '').toLowerCase().includes(bancoSearchTerm.toLowerCase())
                    ).length === 0 && (
                        <p className="text-center text-sm text-gray-500 py-8">
                          {bancoSearchTerm ? "No se encontraron requisitos con esa búsqueda." : "No hay más requisitos disponibles para esta área."}
                        </p>
                      )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal para ver imagen en primera plana */}
      <Dialog open={imagenModal.isOpen} onOpenChange={(open) => {
        if (!open) setImagenModal({ isOpen: false, url: '', itemId: null });
      }}>
        <DialogContent className="sm:max-w-4xl bg-black border-none p-0 overflow-hidden rounded-xl shadow-2xl flex flex-col h-[90vh]">
          <DialogHeader className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex flex-row items-center justify-between">
            <DialogTitle className="text-white">Evidencia Fotográfica</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden bg-black/90">
            {imagenModal.url && (
              <img 
                src={imagenModal.url} 
                alt="Evidencia" 
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
          <DialogFooter className="bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 p-4 z-10 sm:justify-between flex-row">
            <Button 
              variant="destructive" 
              className="gap-2"
              onClick={() => {
                if (imagenModal.itemId) {
                  handleDeleteImage(imagenModal.itemId);
                }
              }}
              disabled={isUploading === imagenModal.itemId}
            >
              <Trash2 className="w-4 h-4" />
              {isUploading === imagenModal.itemId ? 'Eliminando...' : 'Eliminar foto'}
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              onClick={() => setImagenModal({ isOpen: false, url: '', itemId: null })}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}