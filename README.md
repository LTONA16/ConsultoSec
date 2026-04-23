# ConsultoSec

ConsultoSec es un sistema integral de gestión diseñado específicamente para consultorías de seguridad y control de calidad en laboratorios (químicos, metalúrgicos, industriales, etc.). 

Esta plataforma permite administrar solicitudes de auditoría, gestionar el estado de los proyectos, evaluar vulnerabilidades e incidentes, y asegurar el cumplimiento de normativas de calidad.

## 🚀 Tecnologías (Tech Stack)

Este proyecto está construido bajo una arquitectura **Monorepo** utilizando las siguientes tecnologías:

### Frontend
* **Framework:** React.js (inicializado con Vite)
* **Estilos:** Tailwind CSS v4
* **Enrutamiento:** React Router DOM
* **Despliegue:** Vercel

### Backend
* **Framework:** Python / Django
* **API:** Django REST Framework (DRF)
* **Documentación:** drf-spectacular (Swagger UI)
* **Servidor de Producción:** Gunicorn + Whitenoise
* **Despliegue:** Railway

### Infraestructura & DevOps
* **Base de Datos:** PostgreSQL 15 (Dockerizada para desarrollo local)
* **Contenedores:** Docker & Docker Compose
* **CI/CD:** GitHub Actions (Pruebas, Linting y Despliegue automatizado)

---

## 📂 Estructura del Proyecto

```text
consultosec/
├── backend/                # API RESTful en Django
│   ├── core/               # Configuración principal de Django
│   ├── consultas/          # Módulo principal de gestión de servicios
│   ├── requirements.txt    # Dependencias de Python
│   └── Dockerfile          # Configuración de contenedor para producción
│
├── frontend/               # Cliente web en React
│   ├── src/
│   │   ├── components/     # Componentes UI reutilizables
│   │   ├── features/       # Módulos por dominio (ej. consultas, auth)
│   │   └── pages/          # Vistas principales
│   ├── package.json        # Dependencias de Node
│   └── vite.config.js      # Configuración de empaquetado
│
└── docker-compose.yml      # Orquestación de la BD local
```

---

## 🛠️ Configuración del Entorno de Desarrollo

Sigue estos pasos para levantar el proyecto en tu máquina local.

### Prerrequisitos
Asegúrate de tener instalado:
* [Python 3.11+](https://www.python.org/downloads/)
* [Node.js 18+](https://nodejs.org/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clonar el repositorio
```bash
git clone [https://github.com/LTONA16/ConsultoSec.git](https://github.com/LTONA16/ConsultoSec.git)
cd ConsultoSec
```

### 2. Levantar la Base de Datos (PostgreSQL)
El proyecto utiliza Docker para manejar la base de datos localmente sin configuraciones complejas.
```bash
# En la raíz del proyecto
docker-compose up -d
```
*La base de datos estará corriendo en el puerto `5432`.*

### 3. Configurar el Backend (Django)
Abre una terminal y navega a la carpeta del backend:
```bash
cd backend

# Crear y activar entorno virtual (Linux/Mac)
python -m venv venv
source venv/bin/activate
# En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones a la base de datos
python manage.py migrate

# Iniciar el servidor
python manage.py runserver
```
*El backend estará disponible en `http://127.0.0.1:8000/`.*

### 4. Configurar el Frontend (React)
Abre una **nueva** terminal y navega a la carpeta del frontend:
```bash
cd frontend

# Instalar dependencias de Node
npm install

# Iniciar el servidor de desarrollo de Vite
npm run dev
```
*El frontend estará disponible en `http://localhost:5173/`.*

---

## 📚 Documentación de la API

La API cuenta con documentación interactiva autogenerada gracias a Swagger. 
Con el backend corriendo, visita:
* **Swagger UI:** `http://127.0.0.1:8000/api/docs/`
* **Esquema OpenAPI:** `http://127.0.0.1:8000/api/schema/`

---

## 🌿 Flujo de Trabajo en Git

Para mantener el orden en el repositorio, sigue estas instrucciones:

### Obtener los últimos cambios
Siempre mantén tu entorno local actualizado antes de empezar a trabajar:
```bash
# Descarga la información de todas las ramas
git fetch --all

# Trae y fusiona los cambios de la rama actual
git pull
```

### Crear una nueva rama (Feature o Bugfix)
Para trabajar en una nueva funcionalidad o corrección, crea una rama desde `staging`. Utilizamos la siguiente nomenclatura para el nombre de las ramas:
`tipo/[be o fe]-[descripcion-corta]`

* **tipo:** `feat` (nueva funcionalidad), `fix` (corrección de error), `docs` (documentación), etc.
* **[be o fe]:** `be` para Backend, `fe` para Frontend.
* **descripcion:** Breve, en minúsculas y separada por guiones.

Ejemplo de cómo crear y subir una nueva rama:
```bash
# Asegúrate de partir desde staging actualizado
git checkout staging
git pull origin staging

# Crea la nueva rama y muévete a ella
git checkout -b feat/be-endpoint-usuarios

# Realiza tus cambios y haz el commit
git add .
git commit -m "Agregado endpoint para listar usuarios"

# Sube la nueva rama al repositorio remoto (la primera vez)
git push -u origin feat/be-endpoint-usuarios
```

### Subir cambios (Push)
> **⚠️ IMPORTANTE:** Está **estrictamente prohibido** hacer push directo a la rama `main`. Todos los cambios deben enviarse primero a la rama de `staging` o a tu rama de desarrollo.

Para subir tus cambios a staging:
```bash
# Asegúrate de estar en la rama staging (o tu rama de feature)
git checkout staging

# Es buena práctica hacer pull antes de intentar subir para evitar conflictos
git pull origin staging

# Sube tus cambios a la rama staging
git push origin staging
```

---

## ☁️ Despliegue (Producción)

El proyecto está configurado para un despliegue continuo (CD) fluido:
1. **Frontend:** Desplegado en **Vercel**. Cualquier cambio en la rama `main` dentro de la carpeta `frontend/` disparará un nuevo build automáticamente.
2. **Backend & BD:** Alojado en **Railway**. El archivo `Dockerfile` en la carpeta `backend/` se encarga de empaquetar la aplicación y conectarla a la base de datos de producción mediante variables de entorno (`DATABASE_URL`).

---
*Desarrollado para elevar los estándares de seguridad y calidad.*