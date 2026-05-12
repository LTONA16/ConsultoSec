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
    <div className="min-h-screen flex w-full">
      {/* Left side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          <div className="text-left mb-10">
            <h1 className="text-3xl font-bold text-center text-[#003087] mb-3">
              ¡Bienvenido!
            </h1>
            <p className="text-[15px] text-center text-gray-500">
              Ingresa tus credenciales para acceder al Sistema de Consultoría de Laboratorios.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[16px] font-medium text-gray-700">Usuario o Correo</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-[15px] rounded-lg border-gray-300 focus:border-[#003087] focus:ring-[#003087] transition-colors"
                placeholder="ejemplo@unison.mx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[16px] font-medium text-gray-700">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-[15px] rounded-lg border-gray-300 focus:border-[#003087] focus:ring-[#003087] transition-colors"
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-[14px] mt-2 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{errorMsg}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#003087] hover:bg-[#002366] text-white text-[16px] font-medium rounded-lg transition-all duration-200"
            >
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </Button>
          </form>

          <p className="text-center text-[13px] text-gray-500 mt-10">
            División de Ingeniería — Universidad de Sonora
          </p>
        </div>
      </div>

      {/* Right side: Gradient with logo */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#003087] to-[#00153b] items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="w-96 h-96 mb-8 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Universidad de Sonora"
              className="w-full h-full object-contain filter brightness-0 invert drop-shadow-2xl opacity-95 transition-transform duration-500 hover:scale-105"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">
            ConsultoSec
          </h2>
          <p className="text-blue-100 text-lg max-w-md font-light leading-relaxed">
            Plataforma integral para la gestión y auditoría de los laboratorios de la División de Ingeniería.
          </p>
        </div>
      </div>
    </div>
  );
}
