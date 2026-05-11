import React from 'react';
import { Dialog, DialogContent } from '../../../app/components/ui/dialog';
import { Badge } from '../../../app/components/ui/badge';
import { Button } from '../../../app/components/ui/button';
import { 
  ClipboardCheck, 
  Calendar, 
  Clock as ClockIcon, 
  Users, 
  Info, 
  XCircle, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { Consulta, Usuario } from '../services/consultasService';

interface ConsultaDetalleModalProps {
  selectedAudit: Consulta | null;
  onClose: () => void;
  onAction?: (audit: Consulta, isChecklist: boolean) => void;
  onDeleteRequest?: (auditId: number) => void;
  confirmandoId?: number | null;
  rechazando?: boolean;
  onConfirmDelete?: (auditId: number) => void;
  onCancelDelete?: () => void;
  consultores?: Usuario[]; // Para mapear IDs a nombres si es necesario (principalmente en Admin)
  isAdmin?: boolean;
}

const getEstadoInfo = (estado: string) => {
  switch (estado) {
    case 'agendada': return { label: 'Agendada', badgeColor: 'bg-gray-500', isChecklist: true };
    case 'revision_previa': return { label: 'Revisión Previa', badgeColor: 'bg-[#8B5CF6]', isChecklist: true };
    case 'revision_verificacion': return { label: 'Revisión con Lista de Verificación', badgeColor: 'bg-[#003087]', isChecklist: true };
    case 'mejoras_solicitadas': return { label: 'En Mejoras', badgeColor: 'bg-[#F59E0B]', isChecklist: false };
    case 'ultima_revision': return { label: 'Última Revisión', badgeColor: 'bg-[#8B5CF6]', isChecklist: true };
    case 'finalizada': return { label: 'Finalizada', badgeColor: 'bg-[#1D9E75]', isChecklist: false };
    case 'pendiente': return { label: 'Pendiente', badgeColor: 'bg-red-500', isChecklist: false };
    case 'cancelada': return { label: 'Cancelada', badgeColor: 'bg-gray-800', isChecklist: false };
    default: return { label: estado, badgeColor: 'bg-gray-500', isChecklist: false };
  }
};

export const ConsultaDetalleModal: React.FC<ConsultaDetalleModalProps> = ({
  selectedAudit,
  onClose,
  onAction,
  onDeleteRequest,
  confirmandoId,
  rechazando,
  onConfirmDelete,
  onCancelDelete,
  consultores = [],
  isAdmin = false
}) => {
  if (!selectedAudit) return null;

  const info = getEstadoInfo(selectedAudit.estado);

  return (
    <Dialog open={!!selectedAudit} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="flex flex-col h-full">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-[#003087] to-[#0056b3] p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ClipboardCheck className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm px-3 py-1">
                  ID: #{selectedAudit.id}
                </Badge>
                <Badge className={`${info.badgeColor} text-white border-none px-3 py-1`}>
                  {info.label}
                </Badge>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                {selectedAudit.area_nombre || 'Detalles de la Auditoría'}
              </h2>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-8 space-y-8">
            {/* Grid de información rápida */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Fecha de creación
                </p>
                <p className="text-[15px] font-semibold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {new Date(selectedAudit.fecha_creacion).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <ClockIcon className="w-3.5 h-3.5" /> Última actualización
                </p>
                <p className="text-[15px] font-semibold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {new Date(selectedAudit.fecha_actualizacion).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Responsables */}
            <div className="space-y-3">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Equipo de Responsables
              </p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[60px] flex items-center flex-wrap gap-2">
                {selectedAudit.responsables && selectedAudit.responsables.length > 0 ? (
                  consultores && consultores.length > 0 ? (
                    selectedAudit.responsables.map(id => {
                      const c = consultores.find(c => c.id === id);
                      const name = c ? `${c.first_name || c.username} ${c.last_name || ''}`.trim() : `Consultor ID: ${id}`;
                      return (
                        <Badge key={id} variant="secondary" className="bg-blue-50 text-[#003087] border-blue-100 font-medium">
                          {name}
                        </Badge>
                      );
                    })
                  ) : (
                    <p className="text-[14px] text-gray-600 font-medium">
                      {selectedAudit.responsables.length} consultores asignados a este laboratorio.
                    </p>
                  )
                ) : (
                  <p className="text-[14px] text-gray-600 font-medium">No se han listado responsables específicos.</p>
                )}
              </div>
            </div>

            {/* Notas generales */}
            <div className="space-y-3">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> Notas de la Auditoría
              </p>
              <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 italic">
                <p className="text-[14px] text-gray-700 leading-relaxed">
                  {selectedAudit.notas || "Sin notas adicionales registradas para este laboratorio."}
                </p>
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-4">
            {onDeleteRequest ? (
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold px-6 h-12 rounded-xl transition-all active:scale-95 gap-2"
                onClick={() => onDeleteRequest(selectedAudit.id)}
              >
                <XCircle className="w-4 h-4" />
                Eliminar Solicitud
              </Button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 h-12 px-6 font-bold"
              >
                Cerrar
              </Button>
              {onAction && !isAdmin && (
                <Button
                  onClick={() => onAction(selectedAudit, info.isChecklist)}
                  className="bg-[#003087] hover:bg-[#002366] text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-blue-900/20 gap-2 transition-all active:scale-95"
                >
                  Ir al Trabajo <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Overlay de confirmación de borrado */}
          {confirmandoId === selectedAudit.id && onConfirmDelete && onCancelDelete && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in zoom-in duration-200">
              <div className="max-w-sm text-center space-y-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">¿Estás totalmente seguro?</h3>
                  <p className="text-sm text-gray-500">
                    Esta auditoría se ocultará de tu panel. Esta acción no se puede deshacer de forma sencilla.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white h-12 font-bold rounded-xl w-full"
                    onClick={() => onConfirmDelete(selectedAudit.id)}
                    disabled={rechazando}
                  >
                    {rechazando ? "Procesando..." : "Sí, eliminar definitivamente"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-12 font-bold text-gray-500 w-full"
                    onClick={onCancelDelete}
                    disabled={rechazando}
                  >
                    Mejor no, regresar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
