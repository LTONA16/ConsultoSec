export interface ChecklistItem {
  id: number;
  consulta: number;
  area: string;
  categoria: string;
  requisito: string;
  normativa_aplicable: string | null;
  cumple: 'si' | 'no' | 'parcial' | 'no_evaluado';
  observacion: string;
  mejora: string;
  comentarios: string;
  imagen: string | null;
}

export interface Consulta {
  id: number;
  notas: string;
  area_laboratorio: number | null;
  area_nombre: string | null;
  estado: 'agendada' | 'revision_previa' | 'revision_verificacion' | 'mejoras_solicitadas' | 'ultima_revision' | 'finalizada' | 'pendiente' | 'cancelada';
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_finalizacion: string | null;
  fecha_finalizacion_propuesta: string | null;
  items_checklist: ChecklistItem[];
  responsables: number[];
}

export interface AreaLaboratorio {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active?: boolean;
}

const API_URL = "http://localhost:8000/api";

export const consultasService = {
  async obtenerConsultas(token: string): Promise<Consulta[]> {
    const response = await fetch(`${API_URL}/consultas/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener las consultas");
    }

    return response.json();
  },

  async obtenerConsulta(token: string, id: number): Promise<Consulta> {
    const response = await fetch(`${API_URL}/consultas/${id}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener la consulta ${id}`);
    }

    return response.json();
  },

  async actualizarConsulta(token: string, id: number, data: Partial<Consulta>): Promise<Consulta> {
    const response = await fetch(`${API_URL}/consultas/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar la consulta");
    return response.json();
  },

  async actualizarChecklistItem(token: string, id: number, data: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const response = await fetch(`${API_URL}/checklists/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar el item del checklist");
    return response.json();
  },

  async obtenerAreas(token: string): Promise<AreaLaboratorio[]> {
    const response = await fetch(`${API_URL}/areas-laboratorio/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    if (!response.ok) throw new Error("Error al obtener las áreas");
    return response.json();
  },

  async obtenerConsultores(token: string): Promise<Usuario[]> {
    const response = await fetch(`${API_URL}/users/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    if (!response.ok) throw new Error("Error al obtener los consultores");
    return response.json();
  },

  async crearConsulta(token: string, data: Partial<Consulta>): Promise<Consulta> {
    const response = await fetch(`${API_URL}/consultas/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear la consulta");
    return response.json();
  }
};
