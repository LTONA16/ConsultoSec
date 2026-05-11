import re

with open('frontend/src/app/pages/consultor/Auditorias.tsx', 'r') as f:
    content = f.read()

# 1. Imports
imports_to_add = """import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command';
import { Loader2, X, Check, ChevronsUpDown } from 'lucide-react';
import { AreaLaboratorio, Usuario } from '../../../features/consultas/services/consultasService';
"""

content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\n" + imports_to_add)

# 2. States
state_hook = """  // Form State
  const [areas, setAreas] = useState<AreaLaboratorio[]>([]);
  const [consultores, setConsultores] = useState<Usuario[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [fechaPropuesta, setFechaPropuesta] = useState<string>('');
  const [selectedConsultores, setSelectedConsultores] = useState<Usuario[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [submitting, setSubmitting] = useState(false);

"""

content = content.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n" + state_hook)

# 3. useEffect
old_promise = """      Promise.all([
        consultasService.obtenerConsultas(token),
        consultasService.obtenerCapacitaciones(token)
      ]).then(([audData, capData]) => {"""

new_promise = """      Promise.all([
        consultasService.obtenerConsultas(token),
        consultasService.obtenerCapacitaciones(token),
        consultasService.obtenerAreas(token),
        consultasService.obtenerConsultores(token)
      ]).then(([audData, capData, areasData, consData]) => {
        setAreas(areasData);
        setConsultores(consData);"""

content = content.replace(old_promise, new_promise)

# 4. Handlers
handlers = """  const consultoresDisponibles = consultores.filter(c => c.role === 'CONSULTOR' && c.is_active);

  const toggleConsultor = (consultor: Usuario) => {
    const exists = selectedConsultores.find(c => c.id === consultor.id);
    if (exists) {
      setSelectedConsultores(selectedConsultores.filter(c => c.id !== consultor.id));
    } else {
      setSelectedConsultores([...selectedConsultores, consultor]);
    }
  };

  const handleRemoveConsultor = (id: number) => {
    setSelectedConsultores(selectedConsultores.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArea || !fechaPropuesta || selectedConsultores.length === 0) {
      toast.warning("Campos incompletos", {
        description: "Por favor selecciona el área, la fecha y al menos un consultor."
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload: Partial<Consulta> = {
        area_laboratorio: parseInt(selectedArea),
        fecha_finalizacion_propuesta: `${fechaPropuesta}T12:00:00`,
        responsables: selectedConsultores.map(c => c.id),
        estado: 'agendada'
      };
      const nueva = await consultasService.crearConsulta(token!, payload);
      setAuditorias([nueva, ...auditorias]);
      toast.success("Solicitud agendada");
      setSelectedArea('');
      setFechaPropuesta('');
      setSelectedConsultores([]);
    } catch (error) {
      toast.error("Error al crear la solicitud");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

"""

content = content.replace("const laboratoriosUnicos = useMemo(() => {", handlers + "const laboratoriosUnicos = useMemo(() => {")

# 5. JSX structure
form_jsx = """
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <Card className="p-6 border border-[#E8E8E8] sticky top-8 bg-white shadow-sm">
            <h2 className="text-[16px] font-bold text-[#003087] mb-6 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Nueva Solicitud
            </h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="lab">Laboratorio a auditar</Label>
                <Select onValueChange={setSelectedArea} value={selectedArea}>
                  <SelectTrigger id="lab">
                    <SelectValue placeholder="Seleccionar laboratorio" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area.id} value={area.id.toString()}>{area.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha propuesta de finalización</Label>
                <div className="relative">
                  <Input
                    id="fecha"
                    type="date"
                    className="pl-10"
                    value={fechaPropuesta}
                    onChange={(e) => setFechaPropuesta(e.target.value)}
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Asignar consultores</Label>
                <div className="space-y-2">
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full justify-between font-normal text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      >
                        {selectedConsultores.length > 0
                          ? `${selectedConsultores.length} consultor(es) seleccionado(s)`
                          : "Seleccionar consultores..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] xl:w-[350px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar por nombre..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No se encontraron consultores.</CommandEmpty>
                          <CommandGroup>
                            {consultoresDisponibles.map((cUser) => {
                              const isSelected = selectedConsultores.some(c => c.id === cUser.id);
                              return (
                                <CommandItem
                                  key={cUser.id}
                                  value={`${cUser.first_name} ${cUser.last_name} ${cUser.username}`}
                                  onSelect={() => toggleConsultor(cUser)}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 text-[#003087] transition-opacity ${isSelected ? "opacity-100" : "opacity-0"
                                      }`}
                                  />
                                  <span>
                                    {cUser.first_name || cUser.username} {cUser.last_name}
                                  </span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedConsultores.map(consultor => (
                      <Badge key={consultor.id} variant="secondary" className="bg-blue-50 text-[#003087] border-blue-100 flex items-center gap-1.5 py-1">
                        {consultor.first_name || consultor.username}
                        <button
                          type="button"
                          onClick={() => handleRemoveConsultor(consultor.id)}
                          className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#003087] hover:bg-[#002366] text-white py-6 shadow-md transition-all active:scale-[0.98]"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Agendar Visita"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
        <div className="xl:col-span-2 space-y-4">
"""

content = content.replace("{/* Controles de Filtros */}", form_jsx + "\n      {/* Controles de Filtros */}")

# Now we need to close the divs. 
# There's a </div> at the end of the grid list.
# Currently at the end we have:
#       </div>
#       </div>
#       {/* Modal de Detalles */}

content = content.replace("      </div>\n      </div>\n      {/* Modal de Detalles */}", "      </div>\n      </div>\n      </div>\n      {/* Modal de Detalles */}")


with open('frontend/src/app/pages/consultor/Auditorias.tsx', 'w') as f:
    f.write(content)
