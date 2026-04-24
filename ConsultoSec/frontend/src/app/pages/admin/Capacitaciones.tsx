import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Upload, 
  X, 
  Plus,
  Trash2,
  FileText
} from 'lucide-react';

// --- TIPOS DE DATOS ---
interface Asistente {
  nombre: string;
  apellido: string;
}

interface Training {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  laboratorio: string;
  asistentes: Asistente[];
  auditoriaId: string;
  materialesCount: number;
}

// --- SUB-COMPONENTE: Tarjeta de Capacitación ---
const TrainingCard = ({ training, onEdit }: { training: Training, onEdit: (t: Training) => void }) => (
  <div className="bg-white border border-[#E8E8E8] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow text-left">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-lg font-bold text-gray-900">{training.titulo}</h3>
      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
        {training.auditoriaId}
      </span>
    </div>
    
    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{training.descripcion}</p>
    
    <div className="flex gap-6 text-sm text-gray-600 mb-4">
      <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> {training.fecha}</div>
      <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {training.laboratorio}</div>
      <div className="flex items-center gap-2"><Users size={16} className="text-gray-400"/> {training.asistentes.length} asistentes</div>
    </div>

    <div className="flex gap-3 border-t border-gray-50 pt-4">
      <button 
        onClick={() => onEdit(training)}
        className="px-4 py-1.5 bg-gray-900 text-white rounded text-sm font-semibold hover:bg-gray-800 transition-colors"
      >
        Editar / Ver detalles
      </button>
      <button className="px-4 py-1.5 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">
        Descargar materiales
      </button>
    </div>
  </div>
);

// --- SUB-COMPONENTE: Drawer de Registro ---
const AddTrainingDrawer = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingTraining 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (t: Training) => void,
  editingTraining: Training | null 
}) => {
  
  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('2026-04-22');
  const [laboratorio, setLaboratorio] = useState('');
  const [auditoria, setAuditoria] = useState('');
  const [asistentes, setAsistentes] = useState<Asistente[]>([{ nombre: '', apellido: '' }]);

  // Efecto para cargar datos si estamos editando
  useEffect(() => {
    if (editingTraining) {
      setTitulo(editingTraining.titulo);
      setDescripcion(editingTraining.descripcion);
      setFecha(editingTraining.fecha);
      setLaboratorio(editingTraining.laboratorio);
      setAuditoria(editingTraining.auditoriaId);
      setAsistentes(editingTraining.asistentes);
    } else {
      // Limpiar campos si es nuevo
      setTitulo('');
      setDescripcion('');
      setFecha('2026-04-22');
      setLaboratorio('');
      setAuditoria('');
      setAsistentes([{ nombre: '', apellido: '' }]);
    }
  }, [editingTraining, isOpen]);

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nuevosAsistentes = [...asistentes];
    nuevosAsistentes[index] = { ...nuevosAsistentes[index], [name]: value };
    setAsistentes(nuevosAsistentes);
  };

  const handleGuardar = () => {
    if (!titulo) return alert("El título es obligatorio");

    const nuevaCapacitacion: Training = {
      id: editingTraining?.id || Math.random().toString(36).substr(2, 9),
      titulo,
      descripcion,
      fecha,
      laboratorio,
      asistentes,
      auditoriaId: auditoria,
      materialesCount: 1
    };

    onSave(nuevaCapacitacion);
    onClose();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />}
      
      <div className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-[70] transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col text-left`}>
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{editingTraining ? 'Editar' : 'Registrar'} Capacitación</h2>
            <p className="text-xs text-gray-500">Completa la información detallada abajo.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X size={20}/></button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-5">
          {/* Título y Descripción */}
          <div className="space-y-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 block">Título de la capacitación</label>
              <input 
                type="text" 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Uso de equipo de protección" 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 block">Descripción / Objetivo</label>
              <textarea 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe brevemente de qué trata la sesión..." 
                className="w-full p-2 border border-gray-300 rounded-md h-24 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 block">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 block">Auditoría</label>
              <select value={auditoria} onChange={(e) => setAuditoria(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
                <option value="">Seleccionar</option>
                <option value="AUD-2026-004">AUD-2026-004</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Laboratorio</label>
            <select value={laboratorio} onChange={(e) => setLaboratorio(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
              <option value="">Seleccionar laboratorio</option>
              <option value="Manufactura Avanzada">Manufactura Avanzada</option>
              <option value="Eléctrica">Eléctrica</option>
            </select>
          </div>

          {/* Registro de Asistentes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block border-b pb-1">Asistentes Registrados ({asistentes.length})</label>
            <div className="space-y-2">
              {asistentes.map((asistente, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={asistente.nombre}
                    onChange={(e) => handleInputChange(index, e)}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    value={asistente.apellido}
                    onChange={(e) => handleInputChange(index, e)}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
                  />
                  <button onClick={() => setAsistentes(asistentes.filter((_, i) => i !== index))} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setAsistentes([...asistentes, { nombre: '', apellido: '' }])} className="flex items-center gap-1 text-sm font-bold text-[#003087] hover:text-blue-800">
              <Plus size={16}/> Agregar asistente
            </button>
          </div>

          {/* Dropzones */}
          <div className="grid grid-cols-2 gap-4">
             <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50">
                <Upload className="mx-auto text-gray-400 mb-1" size={20}/>
                <p className="text-[10px] text-gray-600 font-medium">Materiales PDF/PPT</p>
             </div>
             <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50">
                <Upload className="mx-auto text-gray-400 mb-1" size={20}/>
                <p className="text-[10px] text-gray-600 font-medium">Fotos Evidencia</p>
             </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-md font-bold text-gray-700 hover:bg-gray-100">
            Cancelar
          </button>
          <button 
            onClick={handleGuardar}
            className="flex-1 py-2.5 bg-[#003087] text-white rounded-md font-bold hover:bg-blue-800 shadow-lg"
          >
            {editingTraining ? 'Actualizar Cambios' : 'Guardar Capacitación'}
          </button>
        </div>
      </div>
    </>
  );
};

// --- COMPONENTE PRINCIPAL ---
export const Capacitaciones = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  
  // Convertimos la lista en un ESTADO para que se pueda actualizar
  const [trainings, setTrainings] = useState<Training[]>([
    { 
      id: '1', 
      titulo: 'Uso seguro de equipos de soldadura', 
      descripcion: 'Capacitación práctica sobre medidas de seguridad en el área de soldadura industrial.',
      fecha: '2026-04-10', 
      laboratorio: 'Manufactura Avanzada', 
      asistentes: Array(15).fill({nombre: 'Juan', apellido: 'Pérez'}), 
      auditoriaId: 'AUD-2026-004', 
      materialesCount: 1 
    },
  ]);

  const handleSaveTraining = (newTraining: Training) => {
    if (editingTraining) {
      // Actualizar existente
      setTrainings(trainings.map(t => t.id === newTraining.id ? newTraining : t));
    } else {
      // Agregar nueva
      setTrainings([newTraining, ...trainings]);
    }
    setEditingTraining(null);
  };

  const handleOpenEdit = (training: Training) => {
    setEditingTraining(training);
    setIsDrawerOpen(true);
  };

  const handleOpenNew = () => {
    setEditingTraining(null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-8 w-full bg-[#F5F5F5] min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-gray-800">Capacitaciones registradas</h2>
          <p className="text-gray-500 text-sm">Registro dinámico de sesiones vinculadas a auditorías.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="bg-[#003087] hover:bg-blue-800 text-white px-6 py-2.5 rounded-md flex items-center gap-2 shadow-md font-semibold"
        >
          <Plus size={20}/> Nueva capacitación
        </button>
      </header>

      <div className="max-w-5xl space-y-5">
        {trainings.length === 0 ? (
          <div className="bg-white p-20 rounded-xl border-2 border-dashed border-gray-200 text-center">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No hay capacitaciones registradas todavía.</p>
          </div>
        ) : (
          trainings.map((t) => (
            <TrainingCard key={t.id} training={t} onEdit={handleOpenEdit} />
          ))
        )}
      </div>

      <AddTrainingDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSave={handleSaveTraining}
        editingTraining={editingTraining}
      />
    </div>
  );
};  