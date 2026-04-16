import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Calendar as CalendarIcon, UserPlus, ClipboardCheck, Search } from 'lucide-react';

export function Solicitudes() {
  // Estado para las solicitudes existentes (basado en US-03)
  const [solicitudes] = useState([
    {
      id: 'SOL-001',
      laboratorio: 'Manufactura Avanzada',
      fecha: '2026-04-18',
      consultores: ['Juan Pérez', 'María González'],
      estado: 'Agendado'
    },
    {
      id: 'SOL-002',
      laboratorio: 'Eléctrica',
      fecha: '2026-04-20',
      consultores: ['Carlos López'],
      estado: 'Agendado'
    }
  ]);

  return (
    <div className="p-8 space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-[20px] font-medium text-gray-900">Gestión de Solicitudes</h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Planificación y agendamiento de visitas de consultoría técnica[cite: 89].
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Formulario de Registro (Columna Izquierda) */}
        <div className="xl:col-span-1">
          <Card className="p-6 border border-[#E8E8E8] sticky top-8">
            <h2 className="text-[16px] font-bold text-[#003087] mb-6 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Nueva Solicitud
            </h2>
            
            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="lab">Laboratorio Destino</Label>
                <Select>
                  <SelectTrigger id="lab">
                    <SelectValue placeholder="Seleccionar laboratorio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="man-av">Manufactura Avanzada</SelectItem>
                    <SelectItem value="elec">Eléctrica</SelectItem>
                    <SelectItem value="mec-bas">Mecatrónica Básica</SelectItem>
                    <SelectItem value="mec-av">Mecatrónica Avanzada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha Propuesta</Label>
                <div className="relative">
                  <Input id="fecha" type="date" className="pl-10" />
                  <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Asignar Consultores</Label>
                <div className="space-y-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Buscar consultor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jp">Juan Pérez</SelectItem>
                      <SelectItem value="mg">María González</SelectItem>
                      <SelectItem value="cl">Carlos López</SelectItem>
                      <SelectItem value="am">Ana Martínez</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Lista de consultores seleccionados (visual) */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="bg-blue-50 text-[#003087] border-blue-100 flex items-center gap-1">
                      Juan Pérez <UserPlus className="w-3 h-3" />
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-[#003087] hover:bg-[#002366] text-white py-6 shadow-md transition-all active:scale-[0.98]">
                  Agendar Visita
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Listado de Solicitudes Agendadas (Columna Derecha) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[16px] font-semibold text-gray-900">Visitas Programadas</h2>
            <div className="relative w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <Input placeholder="Buscar por laboratorio..." className="pl-9 h-9 text-[13px]" />
            </div>
          </div>

          <div className="grid gap-4">
            {solicitudes.map((sol) => (
              <Card key={sol.id} className="p-5 border border-[#E8E8E8] hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-[#003087] uppercase tracking-wider">{sol.id}</span>
                      <h3 className="text-[16px] font-bold text-gray-900 mt-0.5">{sol.laboratorio}</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-[13px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        {sol.fecha}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-gray-400" />
                        {sol.consultores.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <Badge className="bg-gray-100 text-gray-600 border-none shadow-none font-medium px-3 py-1">
                      {sol.estado}
                    </Badge>
                    <Button variant="ghost" className="text-[13px] text-[#003087] h-8 px-3">
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Información adicional según requerimientos de seguridad */}
          <div className="mt-8 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <p className="text-[12px] text-blue-700 leading-relaxed">
              <strong>Nota normativa:</strong> Según la norma ISO 45001, todos los expedientes de visita deben almacenarse por un mínimo de 5 años. Asegúrese de adjuntar la documentación correspondiente al finalizar el ciclo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}