from django.db import models
from django.conf import settings
from django.utils import timezone

class Consulta(models.Model):
    TIPO_LAB_CHOICES = [
        ('quimico', 'Químico'),
        ('biologico', 'Biológico'),
        ('fisico', 'Físico'),
        ('clinico', 'Clínico'),
    ]
    
    ESTADO_CHOICES = [
        ('agendada', 'Agendada'),
        ('revision_previa', 'Revisión Previa'),
        ('revision_verificacion', 'Revisión Verificación'),
        ('mejoras_solicitadas', 'Mejoras Solicitadas'),
        ('ultima_revision', 'Última Revisión'),
        ('finalizada', 'Finalizada'),
        ('pendiente', 'Pendiente'),
        ('cancelada', 'Cancelada'),
    ]

    notas = models.TextField(blank=True, help_text="Anotaciones generales sobre la consulta")
    
    tipo_lab = models.CharField(max_length=20, choices=TIPO_LAB_CHOICES, default='quimico')
    
    responsables = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='consultas_asignadas', 
        blank=True
    )
    
    estado = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='agendada')
    
    checklist = models.JSONField(
        default=dict, 
        blank=True, 
        help_text="Estructura dinámica de preguntas y respuestas"
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    fecha_finalizacion = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Consulta"
        verbose_name_plural = "Consultas"

    def __str__(self):
        # Como quitamos titulo y cliente, ahora la identificamos por su ID (Primary Key)
        return f"Consulta #{self.pk} - {self.get_tipo_lab_display()} ({self.get_estado_display()})"

    def save(self, *args, **kwargs):
        if self.estado == 'finalizada' and not self.fecha_finalizacion:
            self.fecha_finalizacion = timezone.now()
            
        elif self.estado != 'finalizada' and self.fecha_finalizacion:
            self.fecha_finalizacion = None
            
        super().save(*args, **kwargs)


class Evidencia(models.Model):
    consulta = models.ForeignKey(
        Consulta, 
        on_delete=models.CASCADE, 
        related_name='evidencias'
    )
    archivo = models.FileField(upload_to='consultosec/evidencias/%Y/%m/%d/')
    comentario = models.CharField(max_length=255, blank=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Actualizado para que apunte al ID de la consulta en lugar del título borrado
        return f"Evidencia de Consulta #{self.consulta.pk}"