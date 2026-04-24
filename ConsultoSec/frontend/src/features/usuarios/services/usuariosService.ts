export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined?: string;
}

const API_URL = "http://localhost:8000/api";

export const usuariosService = {
  async obtenerUsuarios(token: string): Promise<Usuario[]> {
    const response = await fetch(`${API_URL}/users/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }

    return response.json();
  },

  async crearUsuario(token: string, data: Partial<Usuario> & { password?: string }): Promise<Usuario> {
    const response = await fetch(`${API_URL}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error("Error al crear el usuario");
    return response.json();
  },

  async actualizarEstado(token: string, id: number, isActive: boolean): Promise<Usuario> {
    const response = await fetch(`${API_URL}/users/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ is_active: isActive }),
    });
    
    if (!response.ok) throw new Error("Error al actualizar el estado del usuario");
    return response.json();
  },

  async actualizarUsuario(token: string, id: number, data: Partial<Usuario>): Promise<Usuario> {
    const response = await fetch(`${API_URL}/users/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error("Error al actualizar el usuario");
    return response.json();
  }
};
