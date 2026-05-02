# backend/Dockerfile
FROM python:3.12-slim

# Variables de entorno para optimizar Python en contenedores
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema operativo requeridas para PostgreSQL
RUN apt-get update \
    && apt-get install -y gcc libpq-dev bash \
    && rm -rf /var/lib/apt/lists/*

# Instalar librerías de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código del backend
COPY . .

# Recopilar archivos estáticos (Para que Swagger y el panel Admin se vean bien)
RUN python manage.py collectstatic --noinput

# Crear un usuario sin privilegios y asignarle permisos
RUN adduser --disabled-password --no-create-home djangouser \
    && chown -R djangouser:djangouser /app
USER djangouser

# Exponer el puerto (Azure escuchará este puerto)
EXPOSE 8000

# Dar permisos de ejecución al script de entrada y ejecutarlo
CMD ["bash", "entrypoint.sh"]