import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
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
  Send
} from 'lucide-react';

const SECCIONES_FIJAS = [
  { id: 'gen_1', categoria: 'Operaciones Generales', pregunta: '¿El personal cuenta con el Equipo de Protección Personal (EPP) completo y en buen estado?' },
  { id: 'gen_2', categoria: 'Operaciones Generales', pregunta: '¿Las rutas de evacuación y salidas de emergencia están libres de obstáculos y señalizadas?' },
  { id: 'gen_3', categoria: 'Operaciones Generales', pregunta: '¿El área de trabajo se encuentra limpia, ordenada y libre de derrames o residuos?' }
];

const SECCIONES_ESPECIFICAS = {
  'Manufactura Avanzada': [
    { id: 'esp_1', categoria: 'Maquinaria', pregunta: '¿Las guardas de seguridad de las máquinas CNC están operativas?' },
    { id: 'esp_2', categoria: 'Maquinaria', pregunta: '¿Se cuenta con el registro de mantenimiento preventivo de los tornos?' }
  ],
  'Eléctrica': [
    { id: 'esp_3', categoria: 'Instalaciones', pregunta: '¿Los tableros eléctricos cuentan con leyenda de peligro y están bloqueados?' },
    { id: 'esp_4', categoria: 'Instalaciones', pregunta: '¿Se han realizado pruebas de continuidad en las puestas a tierra?' }
  ]
};

export function Checklist() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const labFromUrl = searchParams.get('lab');
  const idFromUrl = searchParams.get('id');

  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const [isFinalizarModalOpen, setIsFinalizarModalOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [preguntasDinamicas, setPreguntasDinamicas] = useState<any[]>([]);
  const [ultimoIdAgregado, setUltimoIdAgregado] = useState('');
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  if (!labFromUrl || !idFromUrl) {
    return (
      <div className="p-8 max-w-3xl mx-auto mt-20 text-center">
        <Card className="p-12 border-dashed border-2 border-gray-300 bg-white">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-[20px] font-bold text-gray-900">Acceso Restringido</h2>
          <p className="text-[15px] text-gray-500 mt-2 mb-8">
            Debes seleccionar una auditoría asignada desde tu panel para cargar el checklist.
          </p>
          <Button onClick={() => navigate('/consultor/auditorias')} className="bg-[#003087] text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Mis Auditorías
          </Button>
        </Card>
      </div>
    );
  }

  const addNuevaPregunta = (categoriaEspecifica?: string) => {
    const nuevoId = `custom_${Date.now()}`;
    const nueva = {
      id: nuevoId,
      categoria: categoriaEspecifica || nuevaCatNombre || 'Adicional',
      pregunta: '',
      esNueva: true
    };
    setPreguntasDinamicas([...preguntasDinamicas, nueva]);
    setUltimoIdAgregado(nuevoId);
  };

  const updateTextoPregunta = (id: string, texto: string) => {
    setPreguntasDinamicas(prev => prev.map(q => q.id === id ? { ...q, pregunta: texto } : q));
  };

  // NUEVA FUNCIÓN: Permite cambiar el nombre de una sección completa
  const updateNombreSeccion = (viejoNombre: string, nuevoNombre: string) => {
    setPreguntasDinamicas(prev => prev.map(q =>
      q.categoria === viejoNombre ? { ...q, categoria: nuevoNombre } : q
    ));
  };

  const eliminarPregunta = (id: string) => {
    setPreguntasDinamicas(prev => prev.filter(q => q.id !== id));
  };
  // Agrupación por categoría
  const secciones = consulta.items_checklist.reduce((acc: any[], curr) => {
    // Find if we already created this category
    const existing = acc.find(c => c.categoria === curr.categoria);
    if (existing) {
      existing.preguntas.push(curr);
    } else {
      acc.push({ categoria: curr.categoria, preguntas: [curr] });
    }
    return acc;
  }, []);

  const seccionesAgrupadas = preguntasDinamicas.reduce((acc: any[], curr) => {
    const sectionIndex = acc.findIndex(s => s.categoria === curr.categoria);
    if (sectionIndex !== -1) {
      acc[sectionIndex].preguntas.push(curr);
    } else {
      acc.push({ categoria: curr.categoria, preguntas: [curr] });
    }
    return acc;
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header informativo renovado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E8E8E8] shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-[#003087]" />
            </div>
            <h1 className="text-[22px] font-bold text-gray-900">Checklist de Auditoría</h1>
          </div>
          <p className="text-[14px] text-gray-500 mt-2">
            Laboratorio: <strong className="text-gray-900">{labFromUrl}</strong>
            <span className="mx-3 text-gray-300">|</span>
            Folio: <strong className="text-[#003087]">{idFromUrl}</strong>
          </p>
        </div>

        {/* Botón de guardar progreso */}
        <Button
          variant="outline"
          onClick={() => navigate('/consultor/auditorias')}
          className="text-gray-600 border-[#E8E8E8] hover:text-[#003087] hover:bg-blue-50 gap-2 transition-colors"
        >
          <PauseCircle className="w-4 h-4" />
          Guardar progreso
        </Button>
      </div>

      <div className="space-y-10 pb-24">
        {[...SECCIONES_FIJAS, ...(SECCIONES_ESPECIFICAS[labFromUrl as keyof typeof SECCIONES_ESPECIFICAS] || [])]
          .reduce((acc: any[], curr) => {
            const last = acc[acc.length - 1];
            if (last && last.categoria === curr.categoria) last.preguntas.push(curr);
            else acc.push({ categoria: curr.categoria, preguntas: [curr] });
            return acc;
          }, []).map((seccion, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-[16px] font-bold text-[#003087] border-b border-[#E8E8E8] pb-2 uppercase tracking-wide">
                {seccion.categoria}
              </h2>

              <div className="grid gap-6">
                {seccion.preguntas.map((q: any) => (
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

                              <Button variant="outline" size="sm" className="h-10 border-[#E8E8E8] gap-2">
                                <Camera className="w-4 h-4 text-gray-400" />
                                Foto
                              </Button>
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
                          className="bg-white border-[#E8E8E8] text-[13px] resize-none"
                          rows={2}
                          value={notas[q.id] || ''}
                          onChange={(e) => handleNota(q.id, e.target.value)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Panel Inferior */}
        <div className="pt-6">
          <Card className="p-8 border-2 border-dashed border-gray-200 bg-gray-50/20 flex flex-col items-center space-y-5">
            <div className="text-center">
              <h3 className="text-[#003087] font-bold text-[16px]">¿Nueva categoría?</h3>
              <p className="text-gray-400 text-[12px]">Crea una nueva sección personalizada</p>
            </div>
            <div className="flex w-full max-w-lg gap-3 bg-white p-2 rounded-xl border border-gray-200">
              <Input
                placeholder="Nombre de sección..."
                value={nuevaCatNombre}
                onChange={(e) => setNuevaCatNombre(e.target.value)}
                className="border-none focus-visible:ring-0 text-[14px]"
              />
              <Button onClick={() => addNuevaPregunta()} className="bg-[#003087] text-white hover:bg-[#002366] gap-2 px-6 h-10">
                <Plus className="w-4 h-4" /> Crear
              </Button>
            </div>
          </Card>
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
    </div>
  );
}