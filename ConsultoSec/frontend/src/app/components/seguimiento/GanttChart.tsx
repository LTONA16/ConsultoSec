import { useMemo } from 'react';
import { Gantt, Willow } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";
import { Badge } from '../ui/badge';
import { GanttChart as GanttIcon } from 'lucide-react';
import { PropuestaMejora } from '../../../features/consultas/services/consultasService';

interface GanttChartProps {
  propuestas: PropuestaMejora[];
  onUpdate: (id: number, data: { fecha_inicio: string; fecha_fin: string }) => void;
  isAdmin: boolean;
}

export function GanttChart({ propuestas, onUpdate, isAdmin }: GanttChartProps) {
  const emptyLinks = useMemo(() => [], []);

  const ganttTasks = useMemo(() => {
    return propuestas.map(p => {
      // Usamos el mismo parseo seguro que en el DatePicker
      const parseDateGantt = (dateStr: string | null) => {
        if (!dateStr) return null;
        const cleanStr = dateStr.length >= 10 ? `${dateStr.substring(0, 10)}T00:00:00` : dateStr;
        return new Date(cleanStr);
      };

      const start = parseDateGantt(p.fecha_inicio) || new Date();
      // En Gantt, la fecha final es exclusiva, así que le sumamos un día a la fecha fin para que cubra todo el día.
      const parsedFin = parseDateGantt(p.fecha_fin);
      const end = parsedFin ? new Date(parsedFin.getTime() + 86400000) : new Date(start.getTime() + 86400000);
      const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        id: p.id.toString(),
        text: `${p.numero_tarea} ${p.accion_correctiva}`,
        start: start,
        end: end,
        duration: duration,
        progress: p.estado === 'completado' ? 100 : p.estado === 'en_proceso' ? 50 : 20,
        type: 'task',
        open: false
      };
    });
  }, [propuestas]);

  const handleGanttChange = (ev: any) => {
    if (isAdmin) return;
    const task = ev.task;

    // Función auxiliar para extraer el YYYY-MM-DD en tiempo local (evita desfase por zona horaria)
    const formatLocal = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Restamos 1 día a la fecha final porque el Gantt usa fechas finales exclusivas,
    // pero nuestra base de datos las usa inclusivas.
    const endLocal = new Date(task.end.getTime() - 86400000);

    const startStr = formatLocal(task.start);
    const endStr = formatLocal(endLocal);

    onUpdate(Number(task.id), {
      fecha_inicio: startStr,
      fecha_fin: endStr
    });
  };

  // --- LOCALIZACIÓN ---
  const columns = useMemo(() => [
    { id: "text", header: "Actividad", width: 300, flexgrow: 1 },
    { id: "start", header: "Inicio", width: 100 },
    { id: "duration", header: "Días", width: 60, align: "center" as const }
  ], []);

  const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const scales = useMemo(() => [
    {
      unit: "month" as const,
      step: 1,
      format: (date: Date) => `${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`
    },
    {
      unit: "day" as const,
      step: 1,
      format: (date: Date) => date.getDate().toString()
    }
  ], []);

  if (propuestas.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-white rounded-lg border border-dashed">
        <GanttIcon size={48} className="mb-4 opacity-20" />
        <p className="text-[14px]">No hay actividades registradas para mostrar</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white p-4 md:p-6 flex flex-col overflow-hidden">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <h2 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
          <GanttIcon size={18} className="text-[#003087]" />
          Cronograma de Actividades
        </h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-[#003087] border-blue-100">Corto</Badge>
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-100">Medio</Badge>
          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-100">Largo</Badge>
        </div>
      </div>

      <div className="relative flex-1 w-full border rounded-lg overflow-hidden shadow-inner bg-white">
        <div className="absolute inset-0">
          <Willow>
            <Gantt
              tasks={ganttTasks}
              links={emptyLinks}
              columns={columns}
              scales={scales}
              onUpdateTask={handleGanttChange}
            />
          </Willow>
        </div>
      </div>

      <style>{`
        .wx-gantt {
          font-family: Inter, system-ui, sans-serif !important;
          height: 52em !important; 
          width: 100% !important;
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        
        .wx-layout, .wx-content, .wx-chart, .wx-area, .wx-scroll, .wx-table-container {
          height: 100% !important;
        }
        
        .wx-gantt-chart, .wx-gantt-grid {
          height: 100% !important;
        }

        .wx-gantt-task-bar {
          border-radius: 4px !important;
          border: none !important;
        }

        .wx-gantt-task-content {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: white !important;
        }
        
        .wx-willow {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}