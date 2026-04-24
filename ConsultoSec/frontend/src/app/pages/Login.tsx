import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../../features/auth/AuthContext';
import { GraduationCap } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      // Redirigimos basándonos en el ROL devuelto por el backend
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else if (userData.role === 'CONSULTOR') {
        navigate('/consultor');
      } else {
        setErrorMsg('Rol no autorizado para acceder a este portal.');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
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
              <Label htmlFor="email" className="text-[16px]">Usuario o Correo</Label>
              <Input
                id="email"
                type="text"
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
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 text-[14px]"
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-[13px] text-center mt-2 font-medium">{errorMsg}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#003087] hover:bg-[#002366] text-white text-[16px]"
            >
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
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
