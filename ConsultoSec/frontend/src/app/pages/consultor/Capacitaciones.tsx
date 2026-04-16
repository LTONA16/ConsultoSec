import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Calendar, Users, Building2 } from 'lucide-react';

interface Capacitacion {
  id: number;
  tema: string;
  fecha: string;
  laboratorio: string;
  asistentes: number;
  auditoriaVinculada: string;
  estadoAuditoria: string;
}

export function Capacitaciones() {
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([
    {
      id: 1,
      tema: 'Uso seguro de equipos de soldadura',
      fecha: '10 Abr 2026',
      laboratorio: 'Manufactura Avanzada',
      asistentes: 15,
      auditoriaVinculada: 'AUD-2026-004',
      estadoAuditoria: 'En curso',
    },
    {
      id: 2,
      tema: 'Protocolos de emergencia eléctrica',
      fecha: '05 Abr 2026',
      laboratorio: 'Eléctrica',
      asistentes: 12,
      auditoriaVinculada: 'AUD-2026-003',
      estadoAuditoria: 'Finalizado',
    }
  ]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Estado para el formulario de nueva capacitación
  const [newCapacitacion, setNewCapacitacion] = useState({
    tema: '',
    fecha: '',
    laboratorio: '',
    asistentes: '',
    auditoriaVinculada: '',
  });

  const handleCreateCapacitacion = () => {
    if (newCapacitacion.tema && newCapacitacion.fecha && newCapacitacion.laboratorio) {
      const capacitacion: Capacitacion = {
        id: capacitaciones.length + 1,
        tema: newCapacitacion.tema,
        fecha: newCapacitacion.fecha,
        laboratorio: newCapacitacion.laboratorio,
        asistentes: parseInt(newCapacitacion.asistentes) || 0,
        auditoriaVinculada: newCapacitacion.auditoriaVinculada || 'N/A',
        estadoAuditoria: 'Agendado',
      };
      setCapacitaciones([...capacitaciones, capacitacion]);
      setIsSheetOpen(false);
      // Limpiar formulario
      setNewCapacitacion({ tema: '', fecha: '', laboratorio: '', asistentes: '', auditoriaVinculada: '' });
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Finalizado': return 'bg-[#1D9E75] text-white';
      case 'En curso': return 'bg-[#003087] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-medium text-gray-900">Capacitaciones registradas</h1>
          <p className="text-[14px] text-gray-500 mt-1">Registro de sesiones vinculadas a las propuestas de mejora</p>
        </div>

        {/* Botón Lateral que abre el Formulario */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="bg-[#003087] hover:bg-[#002366] text-white gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Registrar capacitación
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-[18px] text-[#003087]">Nueva capacitación</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-6">
              
              <div className="space-y-2">
                <Label htmlFor="tema">Tema de la capacitación</Label>
                <Input id="tema" placeholder="Ej: Uso seguro de equipos..." value={newCapacitacion.tema} onChange={(e) => setNewCapacitacion({ ...newCapacitacion, tema: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha de la sesión</Label>
                <Input id="fecha" type="date" value={newCapacitacion.fecha} onChange={(e) => setNewCapacitacion({ ...newCapacitacion, fecha: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laboratorio">Laboratorio vinculado</Label>
                <Select value={newCapacitacion.laboratorio} onValueChange={(value) => setNewCapacitacion({ ...newCapacitacion, laboratorio: value })}>
                  <SelectTrigger id="laboratorio"><SelectValue placeholder="Seleccionar laboratorio" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manufactura Avanzada">Manufactura Avanzada</SelectItem>
                    <SelectItem value="Eléctrica">Eléctrica</SelectItem>
                    <SelectItem value="Mecatrónica Básica">Mecatrónica Básica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asistentes">Número de asistentes</Label>
                <Input id="asistentes" type="number" placeholder="Ej: 15" value={newCapacitacion.asistentes} onChange={(e) => setNewCapacitacion({ ...newCapacitacion, asistentes: e.target.value })} />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#E8E8E8]">
                <Button variant="outline" className="flex-1" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
                <Button className="flex-1 bg-[#003087] hover:bg-[#002366] text-white" onClick={handleCreateCapacitacion}>Guardar</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Lista de Capacitaciones */}
      <div className="grid gap-4">
        {capacitaciones.map((cap) => (
          <Card key={cap.id} className="p-5 border border-[#E8E8E8] bg-white hover:shadow-sm transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-[16px] font-bold text-gray-900">{cap.tema}</h3>
                <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> {cap.fecha}</span>
                  <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-gray-400" /> {cap.laboratorio}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" /> {cap.asistentes} asistentes</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge className={`${getStatusColor(cap.estadoAuditoria)} border-none shadow-none`}>
                  {cap.estadoAuditoria}
                </Badge>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Vinculada a: {cap.auditoriaVinculada}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}