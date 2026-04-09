import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="bg-blue-900 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold tracking-wider">
                    ConsultoSec
                </Link>
                <div className="space-x-6">
                    <Link to="/" className="hover:text-blue-300 transition-colors">
                        Inicio
                    </Link>
                    <Link to="/consultas" className="hover:text-blue-300 transition-colors">
                        Consultas
                    </Link>
                </div>
            </div>
        </nav>
    )
}