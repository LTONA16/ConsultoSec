import { useEffect, useState } from 'react';
import { getConsultas } from '../features/consultas/services';

export default function ConsultasPage() {
    const [consultas, setConsultas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Función que se ejecuta al montar el componente
        const cargarDatos = async () => {
            const data = await getConsultas();
            setConsultas(data);
            setCargando(false);
        };

        cargarDatos();
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Mis Consultas</h2>

            {cargando ? (
                <p className="text-gray-500">Conectando con el servidor de Django...</p>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    {consultas.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No hay consultas registradas aún.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {consultas.map((consulta) => (
                                <li key={consulta.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-900">{consulta.titulo}</h3>
                                            <p className="text-sm text-gray-500 mb-2">Cliente: {consulta.cliente}</p>
                                            <p className="text-gray-700">{consulta.descripcion}</p>
                                        </div>
                                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            {consulta.estado}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}