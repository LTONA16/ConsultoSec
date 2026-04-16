import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Calendar, Users, Building2, Upload, X } from 'lucide-react';

interface Capacitacion {
  id: number;
  tema: string;
  fecha: string;
  laboratorio: string;
  asistentes: number;
  auditoriaVinculada: string;
  estadoAuditoria: string;
  materiales: string[];
  evidencias: string[];
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
      materiales: ['Manual de seguridad.pdf'],
      evidencias: ['foto1.jpg', 'foto2.jpg'],
    },
    {
      id: 2,
      tema: 'Protocolos de emergencia eléctrica',
      fecha: '05 Abr 2026',
      laboratorio: 'Eléctrica',
      asistentes: 12,
      auditoriaVinculada: 'AUD-2026-003',
      estadoAuditoria: 'Finalizado',
      materiales: ['Presentación.pptx'],
      evidencias: ['foto3.jpg'],
    },
    {
      id: 3,
      tema: 'Manejo de residuos peligrosos',
      fecha: '28 Mar 2026',
      laboratorio: 'Mecatrónica Básica',
      asistentes: 18,
      auditoriaVinculada: 'AUD-2026-002',
      estadoAuditoria: 'Finalizado',
      materiales: ['Guía de residuos.pdf'],
      evidencias: ['foto4.jpg', 'foto5.jpg', 'foto6.jpg'],
    },
  ]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newCapacitacion, setNewCapacitacion] = useState({
    tema: '',
    fecha: '',
    laboratorio: '',
    asistentes: '',
    auditoriaVinculada: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleCreateCapacitacion = () => {
    if (
      newCapacitacion.tema &&
      newCapacitacion.fecha &&
      newCapacitacion.laboratorio &&
      newCapacitacion.asistentes &&
      newCapacitacion.auditoriaVinculada
    ) {
      const capacitacion: Capacitacion = {
        id: capacitaciones.length + 1,
        tema: newCapacitacion.tema,
        fecha: newCapacitacion.fecha,
        laboratorio: newCapacitacion.laboratorio,
        asistentes: parseInt(newCapacitacion.asistentes),
        auditoriaVinculada: newCapacitacion.auditoriaVinculada,
        estadoAuditoria: 'En curso',
        materiales: uploadedFiles,
        evidencias: uploadedPhotos,
      };
      setCapacitaciones([...capacitaciones, capacitacion]);
      setNewCapacitacion({
        tema: '',
        fecha: '',
        laboratorio: '',
        asistentes: '',
        auditoriaVinculada: '',
      });
      setUploadedFiles([]);
      setUploadedPhotos([]);
      setIsSheetOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name);
      setUploadedFiles([...uploadedFiles, ...fileNames]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name);
      setUploadedPhotos([...uploadedPhotos, ...fileNames]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Finalizado':
        return 'bg-[#1D9E75] text-white hover:bg-[#1D9E75]';
      case 'En curso':
        return 'bg-[#003087] text-white hover:bg-[#003087]';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-500';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-medium text-gray-900">
            Capacitaciones registradas
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Registro de sesiones de capacitación vinculadas a auditorías
          </p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="bg-[#003087] hover:bg-[#002366] text-white gap-2">
              <Plus className="w-4 h-4" />
              Registrar capacitación
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-[18px]">Nueva capacitación</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="tema">Tema de la capacitación</Label>
                <Input
                  id="tema"
                  placeholder="Ej: Uso seguro de equipos de soldadura"
                  value={newCapacitacion.tema}
                  onChange={(e) =>
                    setNewCapacitacion({ ...newCapacitacion, tema: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha de la sesión</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={newCapacitacion.fecha}
                  onChange={(e) =>
                    setNewCapacitacion({ ...newCapacitacion, fecha: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laboratorio">Laboratorio vinculado</Label>
                <Select
                  value={newCapacitacion.laboratorio}
                  onValueChange={(value) =>
                    setNewCapacitacion({ ...newCapacitacion, laboratorio: value })
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
                <Label htmlFor="asistentes">Número de asistentes</Label>
                <Input
                  id="asistentes"
                  type="number"
                  placeholder="0"
                  value={newCapacitacion.asistentes}
                  onChange={(e) =>
                    setNewCapacitacion({ ...newCapacitacion, asistentes: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditoria">Auditoría vinculada</Label>
                <Select
                  value={newCapacitacion.auditoriaVinculada}
                  onValueChange={(value) =>
                    setNewCapacitacion({ ...newCapacitacion, auditoriaVinculada: value })
                  }
                >
                  <SelectTrigger id="auditoria">
                    <SelectValue placeholder="Seleccionar auditoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUD-2026-004">AUD-2026-004 - Manufactura Avanzada</SelectItem>
                    <SelectItem value="AUD-2026-005">AUD-2026-005 - Eléctrica</SelectItem>
                    <SelectItem value="AUD-2026-006">AUD-2026-006 - Mecatrónica Básica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materiales">Adjuntar materiales</Label>
                <div className="border-2 border-dashed border-[#E8E8E8] rounded-lg p-6 text-center hover:border-[#003087] transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-[14px] text-gray-600 mb-1">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-[12px] text-gray-500">
                    PDF, PPTX, DOCX hasta 10MB
                  </p>
                  <Input
                    id="materiales"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => document.getElementById('materiales')?.click()}
                  >
                    Seleccionar archivos
                  </Button>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#F5F5F5] p-2 rounded"
                      >
                        <span className="text-[14px] text-gray-700">{file}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidencias">Evidencias fotográficas</Label>
                <div className="border-2 border-dashed border-[#E8E8E8] rounded-lg p-6 text-center hover:border-[#003087] transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-[14px] text-gray-600 mb-1">
                    Sube fotos de la sesión
                  </p>
                  <p className="text-[12px] text-gray-500">
                    JPG, PNG hasta 5MB por foto
                  </p>
                  <Input
                    id="evidencias"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => document.getElementById('evidencias')?.click()}
                  >
                    Seleccionar fotos
                  </Button>
                </div>
                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {uploadedPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative aspect-square bg-[#F5F5F5] rounded-lg flex items-center justify-center group"
                      >
                        <span className="text-[12px] text-gray-600 text-center px-2 break-all">
                          {photo}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#E8E8E8]">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsSheetOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-[#003087] hover:bg-[#002366] text-white"
                  onClick={handleCreateCapacitacion}
                >
                  Guardar capacitación
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Capacitaciones list */}
      <div className="space-y-4">
        {capacitaciones.map((capacitacion) => (
          <Card key={capacitacion.id} className="p-6 border border-[#E8E8E8]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-[16px] font-medium text-gray-900">
                    {capacitacion.tema}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-[14px] text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {capacitacion.fecha}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {capacitacion.laboratorio}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {capacitacion.asistentes} asistentes
                    </div>
                  </div>
                </div>
                <Badge className={`${getStatusColor(capacitacion.estadoAuditoria)} text-[12px]`}>
                  {capacitacion.estadoAuditoria}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-[14px]">
                <div>
                  <span className="text-gray-500">Auditoría vinculada:</span>{' '}
                  <span className="font-medium text-[#003087]">
                    {capacitacion.auditoriaVinculada}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Materiales:</span>{' '}
                  <span className="font-medium">{capacitacion.materiales.length} archivos</span>
                </div>
                <div>
                  <span className="text-gray-500">Evidencias:</span>{' '}
                  <span className="font-medium">{capacitacion.evidencias.length} fotos</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[14px] border-[#E8E8E8] hover:bg-[#F5F5F5]"
                >
                  Ver detalles
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[14px] border-[#E8E8E8] hover:bg-[#F5F5F5]"
                >
                  Descargar materiales
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state - shown when no capacitaciones */}
      {capacitaciones.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-[18px] font-medium text-gray-900 mb-2">
            No hay capacitaciones registradas
          </h3>
          <p className="text-[14px] text-gray-500 mb-6">
            Comienza registrando tu primera sesión de capacitación
          </p>
          <Button
            className="bg-[#003087] hover:bg-[#002366] text-white gap-2"
            onClick={() => setIsSheetOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Registrar capacitación
          </Button>
        </div>
      )}
    </div>
  );
}
