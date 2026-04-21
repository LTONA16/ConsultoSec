export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface AuthResponse {
  refresh: string;
  access: string;
}

const API_URL = "http://localhost:8000/api"; // Default dev url

export const authService = {
  async login(email: string, password: string):Promise<AuthResponse> {
    // SimpleJWT por defecto espera 'username' y 'password'. 
    // Mapeamos el parámetro (aunque se llame email) al campo 'username' para que el backend lo acepte.
    const response = await fetch(`${API_URL}/auth/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: email, password }),
    });

    if (!response.ok) {
      throw new Error("Credenciales inválidas");
    }

    const data: AuthResponse = await response.json();
    return data;
  },

  async getCurrentUser(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/users/me/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener el usuario");
    }

    const data: UserProfile = await response.json();
    return data;
  }
};
