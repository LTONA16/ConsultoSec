import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Upload, 
  X, 
  Plus
} from 'lucide-react';

// --- SUB-COMPONENTE: Tarjeta de Capacitación ---
const TrainingCard = ({ training }: { training: any }) => (
  <div className="bg-white border border-[#E8E8E8] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
    <h3 className="text-lg font-bold text-gray-900 mb-3">{training.titulo}</h3>
    
    <div className="flex gap-6 text-sm text-gray-600 mb-4">
      <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> {training.fecha}</div>
      <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {training.laboratorio}</div>
      <div className="flex items-center gap-2"><Users size={16} className="text-gray-400"/> {training.asistentes} asistentes</div>
    </div>

    <div className="flex gap-8 text-sm mb-6 border-t border-gray-50 pt-4">
      <div>
        <span className="text-gray-500">Auditoría vinculada: </span>
        <span className="font-bold text-[#003087]">{training.auditoriaId}</span>
      </div>
      <div>
        <span className="text-gray-500">Materiales: </span>
        <span className="font-bold text-gray-800">{training.materialesCount} archivo(s)</span>
      </div>
    </div>

    <div className="flex gap-3">
      <button className="px-4 py-1.5 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">
        Ver detalles
      </button>
      <button className="px-4 py-1.5 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">
        Descargar materiales
      </button>
    </div>
  </div>
);

// --- SUB-COMPONENTE: Drawer de Registro ---
const AddTrainingDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <>
    {/* Overlay oscuro */}
    {isOpen && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />
    )}
    
    <div className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-[70] transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col`}>
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Registrar Capacitación</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-5 text-left">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">Fecha de la sesión</label>
          <input type="date" className="w-full p-2 border border-gray-300 rounded-md" defaultValue="2026-04-22" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">Laboratorio vinculado</label>
          <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
            <option>Seleccionar laboratorio</option>
            <option>Manufactura Avanzada</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">Número de asistentes</label>
          <input type="number" placeholder="0" className="w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">Auditoría vinculada</label>
          <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
            <option>Seleccionar auditoría</option>
            <option>AUD-2026-004</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">Adjuntar materiales</label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <Upload className="text-gray-400 mb-2" size={24}/>
            <p className="text-xs text-gray-600">Arrastra archivos aquí o selecciona</p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 block">Evidencias fotográficas</label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <Upload className="text-gray-400 mb-2" size={24}/>
            <p className="text-xs text-gray-600">Sube fotos de la sesión</p>
          </div>
        </div>
      </div>

      <div className="p-6 border-t bg-gray-50 flex gap-4">
        <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-md font-bold text-gray-700 hover:bg-gray-100 transition-colors">
          Cancelar
        </button>
        <button className="flex-1 py-2.5 bg-[#003087] text-white rounded-md font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20">
          Guardar capacitación
        </button>
      </div>
    </div>
  </>
);

// --- COMPONENTE PRINCIPAL ---
export const Capacitaciones = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const trainings = [
    { id: '1', titulo: 'Uso seguro de equipos de soldadura', fecha: '10 Abr 2026', laboratorio: 'Manufactura Avanzada', asistentes: 15, auditoriaId: 'AUD-2026-004', materialesCount: 1 },
    { id: '2', titulo: 'Protocolos de emergencia eléctrica', fecha: '05 Abr 2026', laboratorio: 'Eléctrica', asistentes: 12, auditoriaId: 'AUD-2026-003', materialesCount: 1 },
    { id: '3', titulo: 'Manejo de residuos peligrosos', fecha: '28 Mar 2026', laboratorio: 'Mecatrónica Básica', asistentes: 18, auditoriaId: 'AUD-2026-002', materialesCount: 1 }
  ];

  return (
    <div className="p-8 w-full bg-[#F5F5F5] min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-gray-800">Capacitaciones registradas</h2>
          <p className="text-gray-500 text-sm">Registro de sesiones de capacitación vinculadas a auditorías.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-[#003087] hover:bg-blue-800 text-white px-6 py-2.5 rounded-md flex items-center gap-2 shadow-md transition-all font-semibold"
        >
          <Plus size={20}/> Nueva capacitación
        </button>
      </header>

      {/* LISTADO DE TARJETAS */}
      <div className="max-w-5xl space-y-5 text-left">
        {trainings.map((t) => (
          <TrainingCard key={t.id} training={t} />
        ))}
      </div>

      {/* MODAL LATERAL */}
      <AddTrainingDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};