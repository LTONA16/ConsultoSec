import { useState, useEffect } from 'react';
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
  Edit3
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

  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [preguntasDinamicas, setPreguntasDinamicas] = useState<any[]>([]);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('Nueva Sección');
  const [ultimoIdAgregado, setUltimoIdAgregado] = useState<string | null>(null);

  useEffect(() => {
    if (labFromUrl) {
      const iniciales = [
        ...SECCIONES_FIJAS, 
        ...(SECCIONES_ESPECIFICAS[labFromUrl as keyof typeof SECCIONES_ESPECIFICAS] || [])
      ];
      setPreguntasDinamicas(iniciales);
    }
  }, [labFromUrl]);

  useEffect(() => {
    if (ultimoIdAgregado) {
      const elemento = document.getElementById(ultimoIdAgregado);
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setUltimoIdAgregado(null);
      }
    }
  }, [preguntasDinamicas, ultimoIdAgregado]);

  if (!labFromUrl || !idFromUrl) {
    return (
      <div className="p-8 max-w-3xl mx-auto mt-20 text-center">
        <Card className="p-12 border-dashed border-2 border-gray-300 bg-white">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-[20px] font-bold text-gray-900">Acceso Restringido</h2>
          <Button onClick={() => navigate('/consultor/auditorias')} className="mt-8 bg-[#003087] text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
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

  const handleRespuesta = (id: string, valor: string) => {
    setRespuestas(prev => ({ ...prev, [id]: valor }));
  };

  const handleNota = (id: string, valor: string) => {
    setNotas(prev => ({ ...prev, [id]: valor }));
  };

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
      {/* Header */}
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
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/consultor/auditorias')} className="text-gray-600 gap-2 h-10">
          <PauseCircle className="w-4 h-4" /> Guardar progreso
        </Button>
      </div>

      <div className="space-y-12 pb-40">
        {seccionesAgrupadas.map((seccion, idx) => (
          <div key={idx} className="space-y-5">
            {/* TÍTULO DE SECCIÓN EDITABLE */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 group">
              <div className="flex items-center gap-3 flex-1">
                <LayoutGrid className="w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={seccion.categoria}
                  onChange={(e) => updateNombreSeccion(seccion.categoria, e.target.value)}
                  className="bg-transparent text-[15px] font-bold text-[#003087] uppercase tracking-wider border-none focus:ring-0 p-0 w-full hover:bg-gray-50 rounded cursor-edit"
                  placeholder="Nombre de la sección..."
                />
                <Edit3 className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />
              </div>
              
              <button 
                onClick={() => addNuevaPregunta(seccion.categoria)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#003087] hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all active:scale-95 border border-transparent hover:border-blue-100"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Nueva pregunta
              </button>
            </div>
            
            <div className="grid gap-6">
              {seccion.preguntas.map((q: any) => (
                <Card 
                  key={q.id} 
                  id={q.id} 
                  className={`p-6 border bg-white relative transition-all ${q.esNueva ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-[#E8E8E8]'}`}
                >
                  {q.esNueva && (
                    <button onClick={() => eliminarPregunta(q.id)} className="absolute top-3 right-3 p-1 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      {q.esNueva ? (
                        <div className="flex-1 space-y-2">
                          <Label className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Pregunta Manual</Label>
                          <Textarea 
                            placeholder="¿Se verifica que...?"
                            className="text-[15px] border-blue-100 focus:ring-1 focus:ring-[#003087] min-h-[60px] resize-none"
                            value={q.pregunta}
                            onChange={(e) => updateTextoPregunta(q.id, e.target.value)}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <p className="text-[15px] text-gray-800 font-medium flex-1 pt-1">{q.pregunta}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                          <button onClick={() => handleRespuesta(q.id, 'cumple')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${respuestas[q.id] === 'cumple' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>
                            <CheckCircle2 className="w-4 h-4" /> CUMPLE
                          </button>
                          <button onClick={() => handleRespuesta(q.id, 'parcial')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${respuestas[q.id] === 'parcial' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}>
                            <AlertCircle className="w-4 h-4" /> PARCIAL
                          </button>
                          <button onClick={() => handleRespuesta(q.id, 'no_cumple')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${respuestas[q.id] === 'no_cumple' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>
                            <XCircle className="w-4 h-4" /> NO CUMPLE
                          </button>
                        </div>
                        <Button variant="outline" size="sm" className="h-10 border-[#E8E8E8] gap-2">
                          <Camera className="w-4 h-4 text-gray-400" /> Foto
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100 space-y-2">
                      <Label className="text-[12px] flex items-center gap-2 text-gray-500 font-semibold">
                        <MessageSquare className="w-3.5 h-3.5" /> Observaciones del Auditor
                      </Label>
                      <Textarea 
                        placeholder="Escribe hallazgos..."
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
        ))}

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

        {/* BOTÓN FINALIZAR (Pequeño y texto corregido) */}
        <div className="fixed bottom-8 right-8">
          <Button className="bg-[#003087] hover:bg-[#002366] text-white shadow-lg px-8 py-6 rounded-xl gap-2 font-bold transition-all active:scale-95 border-2 border-white">
            <Save className="w-5 h-5" />
            Finalizar Checklist
          </Button>
        </div>  
      </div>
    </div>
  );
}