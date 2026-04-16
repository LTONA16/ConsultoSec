import { useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'Administrador' | 'Consultor';
  activo: boolean;
  fechaRegistro: string;
}

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      nombre: 'Maestra Viridiana',
      correo: 'viridiana@unison.mx',
      rol: 'Administrador',
      activo: true,
      fechaRegistro: '01 Ene 2024',
    },
    {
      id: 2,
      nombre: 'Juan Pérez',
      correo: 'juan.perez@unison.mx',
      rol: 'Consultor',
      activo: true,
      fechaRegistro: '15 Feb 2024',
    },
    {
      id: 3,
      nombre: 'María González',
      correo: 'maria.gonzalez@unison.mx',
      rol: 'Consultor',
      activo: true,
      fechaRegistro: '20 Feb 2024',
    },
    {
      id: 4,
      nombre: 'Carlos López',
      correo: 'carlos.lopez@unison.mx',
      rol: 'Consultor',
      activo: false,
      fechaRegistro: '10 Mar 2024',
    },
    {
      id: 5,
      nombre: 'Ana Martínez',
      correo: 'ana.martinez@unison.mx',
      rol: 'Consultor',
      activo: true,
      fechaRegistro: '05 Abr 2024',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUsuario, setNewUsuario] = useState({
    nombre: '',
    correo: '',
    rol: '' as 'Administrador' | 'Consultor' | '',
  });

  const handleCreateUsuario = () => {
    if (newUsuario.nombre && newUsuario.correo && newUsuario.rol) {
      const usuario: Usuario = {
        id: usuarios.length + 1,
        nombre: newUsuario.nombre,
        correo: newUsuario.correo,
        rol: newUsuario.rol as 'Administrador' | 'Consultor',
        activo: true,
        fechaRegistro: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      };
      setUsuarios([...usuarios, usuario]);
      setNewUsuario({ nombre: '', correo: '', rol: '' });
      setIsModalOpen(false);
    }
  };

  const toggleUsuarioActivo = (id: number) => {
    setUsuarios(
      usuarios.map((usuario) =>
        usuario.id === id ? { ...usuario, activo: !usuario.activo } : usuario
      )
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-medium text-gray-900">
            Usuarios del sistema
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Gestión de administradores y consultores
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003087] hover:bg-[#002366] text-white gap-2">
              <Plus className="w-4 h-4" />
              Nuevo usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[18px]">Crear nuevo usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Juan Pérez García"
                  value={newUsuario.nombre}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, nombre: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="correo@unison.mx"
                  value={newUsuario.correo}
                  onChange={(e) =>
                    setNewUsuario({ ...newUsuario, correo: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select
                  value={newUsuario.rol}
                  onValueChange={(value: 'Administrador' | 'Consultor') =>
                    setNewUsuario({ ...newUsuario, rol: value })
                  }
                >
                  <SelectTrigger id="rol">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Consultor">Consultor</SelectItem>
                  </SelectContent>
                </Select>
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
                  onClick={handleCreateUsuario}
                >
                  Crear usuario
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
              <TableHead className="text-[14px] font-medium">Nombre</TableHead>
              <TableHead className="text-[14px] font-medium">Correo</TableHead>
              <TableHead className="text-[14px] font-medium">Rol</TableHead>
              <TableHead className="text-[14px] font-medium">Estado</TableHead>
              <TableHead className="text-[14px] font-medium">Fecha de registro</TableHead>
              <TableHead className="text-[14px] font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow
                key={usuario.id}
                className={`hover:bg-[#F5F5F5] ${!usuario.activo ? 'opacity-50' : ''}`}
              >
                <TableCell className="text-[14px] font-medium">
                  {usuario.nombre}
                </TableCell>
                <TableCell className="text-[14px] text-gray-600">
                  {usuario.correo}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${
                      usuario.rol === 'Administrador'
                        ? 'bg-[#003087] text-white hover:bg-[#003087]'
                        : 'bg-[#1D9E75] text-white hover:bg-[#1D9E75]'
                    } text-[12px]`}
                  >
                    {usuario.rol}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={usuario.activo}
                      onCheckedChange={() => toggleUsuarioActivo(usuario.id)}
                      className="data-[state=checked]:bg-[#1D9E75]"
                    />
                    <span className="text-[14px] text-gray-600">
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-[14px] text-gray-600">
                  {usuario.fechaRegistro}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[14px] border-[#E8E8E8] hover:bg-[#F5F5F5]"
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
