import { useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Plus, Eye, ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

type SolicitudStatus = 
  | 'Agendado'
  | 'Revisión Previa'
  | 'Checklist en curso'
  | 'En Mejoras'
  | 'Última Revisión'
  | 'Finalizado';

interface Solicitud {
  id: number;
  laboratorio: string;
  fecha: string;
  consultores: string[];
  estado: SolicitudStatus;
}

const statusConfig: Record<SolicitudStatus, { color: string; bgColor: string }> = {
  'Agendado': { color: 'text-gray-700', bgColor: 'bg-gray-500' },
  'Revisión Previa': { color: 'text-white', bgColor: 'bg-[#003087]' },
  'Checklist en curso': { color: 'text-white', bgColor: 'bg-[#BA7517]' },
  'En Mejoras': { color: 'text-white', bgColor: 'bg-orange-600' },
  'Última Revisión': { color: 'text-white', bgColor: 'bg-purple-600' },
  'Finalizado': { color: 'text-white', bgColor: 'bg-[#1D9E75]' },
};

export function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
    {
      id: 1,
      laboratorio: 'Manufactura Avanzada',
      fecha: '15 Abr 2026',
      consultores: ['Juan Pérez', 'María González'],
      estado: 'Checklist en curso',
    },
    {
      id: 2,
      laboratorio: 'Eléctrica',
      fecha: '10 Abr 2026',
      consultores: ['Carlos López'],
      estado: 'Finalizado',
    },
    {
      id: 3,
      laboratorio: 'Mecatrónica Básica',
      fecha: '20 Abr 2026',
      consultores: ['Ana Martínez', 'Luis Rodríguez'],
      estado: 'Agendado',
    },
    {
      id: 4,
      laboratorio: 'Mecatrónica Avanzada',
      fecha: '18 Abr 2026',
      consultores: ['María González'],
      estado: 'Revisión Previa',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSolicitud, setNewSolicitud] = useState({
    laboratorio: '',
    fecha: '',
    consultores: '',
  });

  const handleCreateSolicitud = () => {
    if (newSolicitud.laboratorio && newSolicitud.fecha && newSolicitud.consultores) {
      const solicitud: Solicitud = {
        id: solicitudes.length + 1,
        laboratorio: newSolicitud.laboratorio,
        fecha: newSolicitud.fecha,
        consultores: newSolicitud.consultores.split(',').map(c => c.trim()),
        estado: 'Agendado',
      };
      setSolicitudes([...solicitudes, solicitud]);
      setNewSolicitud({ laboratorio: '', fecha: '', consultores: '' });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-medium text-gray-900">
            Solicitudes de consultoría
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Gestión de auditorías de laboratorios
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003087] hover:bg-[#002366] text-white gap-2">
              <Plus className="w-4 h-4" />
              Nueva solicitud
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[18px]">Nueva solicitud de auditoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="laboratorio">Laboratorio</Label>
                <Select
                  value={newSolicitud.laboratorio}
                  onValueChange={(value) =>
                    setNewSolicitud({ ...newSolicitud, laboratorio: value })
                  }
                >
                  <SelectTrigger id="laboratorio">
                    <SelectValue placeholder="Seleccionar laboratorio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manufactura Avanzada">Manufactura Avanzada</SelectItem>
                    <SelectItem value="Eléctrica">Eléctrica</SelectItem>
                    <SelectItem value="Mecatrónica Básica">Mecatrónica Básica</SelectItem>
                    <SelectItem value="Mecatrónica Avanzada">Mecatrónica Avanzada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha programada</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={newSolicitud.fecha}
                  onChange={(e) =>
                    setNewSolicitud({ ...newSolicitud, fecha: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultores">Consultores asignados</Label>
                <Input
                  id="consultores"
                  placeholder="Ej: Juan Pérez, María González"
                  value={newSolicitud.consultores}
                  onChange={(e) =>
                    setNewSolicitud({ ...newSolicitud, consultores: e.target.value })
                  }
                />
                <p className="text-[12px] text-gray-500">
                  Separar nombres con comas
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-[#003087] hover:bg-[#002366] text-white"
                  onClick={handleCreateSolicitud}
                >
                  Crear solicitud
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E8E8E8]">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F5F5] hover:bg-[#F5F5F5]">
              <TableHead className="text-[14px] font-medium">Laboratorio</TableHead>
              <TableHead className="text-[14px] font-medium">Fecha</TableHead>
              <TableHead className="text-[14px] font-medium">Consultores asignados</TableHead>
              <TableHead className="text-[14px] font-medium">Estado</TableHead>
              <TableHead className="text-[14px] font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudes.map((solicitud) => {
              const config = statusConfig[solicitud.estado];
              return (
                <TableRow key={solicitud.id} className="hover:bg-[#F5F5F5]">
                  <TableCell className="text-[14px] font-medium">
                    {solicitud.laboratorio}
                  </TableCell>
                  <TableCell className="text-[14px] text-gray-600">
                    {solicitud.fecha}
                  </TableCell>
                  <TableCell className="text-[14px] text-gray-600">
                    {solicitud.consultores.join(', ')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${config.bgColor} ${config.color} hover:${config.bgColor} text-[12px]`}
                    >
                      {solicitud.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[14px] border-[#E8E8E8] hover:bg-[#F5F5F5]"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver detalle
                      </Button>
                      {solicitud.estado !== 'Finalizado' && (
                        <Button
                          size="sm"
                          className="bg-[#003087] hover:bg-[#002366] text-white"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
