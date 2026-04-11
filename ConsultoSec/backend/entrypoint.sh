#!/bin/bash
# backend/entrypoint.sh

# 1. Aplicar migraciones automáticamente
echo "Aplicando migraciones a la base de datos..."
python manage.py migrate --noinput

# 2. Iniciar el servidor web profesional (Gunicorn)
# Usamos 'exec' para que Gunicorn tome el control del proceso PID 1
echo "Iniciando Gunicorn..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3