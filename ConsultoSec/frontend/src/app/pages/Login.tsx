import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { GraduationCap } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (email.includes('admin')) {
      navigate('/admin');
    } else {
      navigate('/consultor');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-8">
          {/* Escudo Unison */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-[#E8E8E8]">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>  
          </div>

          {/* Title and subtitle */}
          <div className="text-center mb-8">
            <h1 className="text-[20px] font-medium text-[#003087] mb-2">
              Sistema de Consultoría de Laboratorios
            </h1>
            <p className="text-[14px] text-gray-600">
              División de Ingeniería — Universidad de Sonora
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[16px]">Correo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 text-[14px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[16px]">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 text-[14px]"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#003087] hover:bg-[#002366] text-white text-[16px]"
            >
              Iniciar sesión
            </Button>
          </form>

          {/* Helper text */}
          <p className="text-center text-[12px] text-gray-500 mt-6">
          </p>
        </div>
      </div>
    </div>
  );
}
