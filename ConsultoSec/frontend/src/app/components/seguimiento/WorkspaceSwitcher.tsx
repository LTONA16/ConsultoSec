import { Table as TableIcon, GanttChart as GanttIcon } from 'lucide-react';

interface WorkspaceSwitcherProps {
  viewMode: 'tablero' | 'cronograma';
  setViewMode: (mode: 'tablero' | 'cronograma') => void;
}

export function WorkspaceSwitcher({ viewMode, setViewMode }: WorkspaceSwitcherProps) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => setViewMode('tablero')}
        className={`flex items-center gap-2 px-4 py-1.5 text-[12px] font-bold rounded-md transition-all ${
          viewMode === 'tablero' ? 'bg-white text-[#003087] shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <TableIcon size={14} />
        TABLERO
      </button>
      <button
        onClick={() => setViewMode('cronograma')}
        className={`flex items-center gap-2 px-4 py-1.5 text-[12px] font-bold rounded-md transition-all ${
          viewMode === 'cronograma' ? 'bg-white text-[#003087] shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <GanttIcon size={14} />
        CRONOGRAMA
      </button>
    </div>
  );
}
