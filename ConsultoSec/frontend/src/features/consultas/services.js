// Centralizamos la URL para que sea fácil cambiarla en producción
const API_URL = 'http://127.0.0.1:8000/api/consultas/';

export const getConsultas = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Error al obtener las consultas');
        }
        return await response.json();
    } catch (error) {
        console.error("Error en getConsultas:", error);
        return [];
    }
};