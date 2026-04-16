from django.db import models
from django.conf import settings

class Consulta(models.Model):
    
    ESTADO_CHOICES = [
        ('agendada', 'Agendada'),
        ('revision_previa', 'Revision Previa'),
        ('revision_verificacion', 'Revision Verificacion'),
        ('mejoras_solicitadas', 'Mejoras Solicitadas'),
        ('ultima_revision', 'Ultima Revision'),
        ('finalizada', 'Finalizada'),
        ('pendiente', 'Pendiente'),
        ('cancelada', 'Cancelada'),
    ]

    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    cliente = models.CharField(max_length=100)
    responsables = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='consultas_asignadas', blank=True)
    estado = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='agendada')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    fecha_finalizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.titulo} - {self.cliente}"