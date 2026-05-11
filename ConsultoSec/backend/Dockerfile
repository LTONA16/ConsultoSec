FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev bash \
       libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz0b libcairo2 \
       libffi-dev libgdk-pixbuf2.0-0 shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN adduser --disabled-password --no-create-home djangouser \
    && chown -R djangouser:djangouser /app

USER djangouser

EXPOSE 8000

CMD ["bash", "entrypoint.sh"]