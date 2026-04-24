import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
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
  PauseCircle
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

  const handleRespuesta = (id: string, valor: string) => {
    setRespuestas(prev => ({ ...prev, [id]: valor }));
  };

  const handleNota = (id: string, valor: string) => {
    setNotas(prev => ({ ...prev, [id]: valor }));
  };

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
                        <p className="text-[15px] text-gray-800 font-medium flex-1 pt-1">
                          {q.pregunta}
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button 
                              onClick={() => handleRespuesta(q.id, 'cumple')}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${respuestas[q.id] === 'cumple' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                            >
                              <CheckCircle2 className="w-4 h-4" /> CUMPLE
                            </button>
                            <button 
                              onClick={() => handleRespuesta(q.id, 'parcial')}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${respuestas[q.id] === 'parcial' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}
                            >
                              <AlertCircle className="w-4 h-4" /> PARCIAL
                            </button>
                            <button 
                              onClick={() => handleRespuesta(q.id, 'no_cumple')}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${respuestas[q.id] === 'no_cumple' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                            >
                              <XCircle className="w-4 h-4" /> NO CUMPLE
                            </button>
                          </div>
                          
                          <Button variant="outline" size="sm" className="h-10 border-[#E8E8E8] gap-2">
                            <Camera className="w-4 h-4 text-gray-400" />
                            Foto
                          </Button>
                        </div>
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
          ))}

        {/* Botón Guardar */}
        <div className="fixed bottom-8 right-8">
          <Button className="bg-[#003087] hover:bg-[#002366] text-white shadow-xl px-10 py-7 rounded-2xl gap-3 font-bold transition-all active:scale-95">
            <Save className="w-6 h-6" />
            Finalizar Auditoría
          </Button>
        </div>
      </div>
    </div>
  );
}