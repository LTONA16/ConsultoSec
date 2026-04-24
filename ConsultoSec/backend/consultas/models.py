import os
import json
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

class AreaCatalogo(models.Model):
    nombre = models.CharField(max_length=150, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre

class RequisitoCatalogo(models.Model):
    area = models.ForeignKey(AreaCatalogo, on_delete=models.CASCADE, related_name='requisitos')
    pregunta = models.TextField()
    normativa_aplicable = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.area.nombre} - {self.pregunta[:30]}"

class Consulta(models.Model):
    
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
    
    area_laboratorio = models.ForeignKey(AreaCatalogo, on_delete=models.PROTECT, related_name='consultas', null=True)
    
    responsables = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='consultas_asignadas', 
        blank=True
    )
    
    estado = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='agendada')

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    fecha_finalizacion = models.DateTimeField(null=True, blank=True)


    class Meta:
        verbose_name = "Consulta"
        verbose_name_plural = "Consultas"

    def __str__(self):
        return f"Consulta #{self.pk} - {self.area_laboratorio.nombre if self.area_laboratorio else 'Sin Área'} ({self.get_estado_display()})"

    def save(self, *args, **kwargs):
        if self.estado == 'finalizada' and not self.fecha_finalizacion:
            self.fecha_finalizacion = timezone.now()
            
        elif self.estado != 'finalizada' and self.fecha_finalizacion:
            self.fecha_finalizacion = None
            
        super().save(*args, **kwargs)

class Capacitacion(models.Model):
    tema = models.CharField(max_length=255)
    fecha = models.DateField()
    responsable = models.CharField(max_length=255)
    asistentes = models.JSONField(blank=True, default=list)

    consulta = models.ForeignKey(
        'Consulta',
        on_delete=models.CASCADE,
        related_name='capacitaciones'
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.tema
    
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


class ChecklistItem(models.Model):
    CUMPLE_CHOICES = [
        ('si', 'Sí'),
        ('no', 'No'),
        ('parcial', 'Parcial'),
        ('no_evaluado', 'No Evaluado'),
    ]

    consulta = models.ForeignKey(Consulta, on_delete=models.CASCADE, related_name='items_checklist')
    
    area = models.CharField(max_length=100)
    requisito = models.TextField()
    normativa_aplicable = models.CharField(max_length=255, null=True, blank=True)
    
    cumple = models.CharField(max_length=20, choices=CUMPLE_CHOICES, default='no_evaluado')
    observacion = models.TextField(blank=True)
    mejora = models.TextField(blank=True)
    comentarios = models.TextField(blank=True)
    imagen = models.ImageField(upload_to='consultosec/checklists/%Y/%m/%d/', null=True, blank=True)

    def __str__(self):
        return f"Checklist {self.consulta.pk} - {self.area}: {self.requisito[:20]}"

@receiver(post_save, sender=Consulta)
def generar_checklist(sender, instance, created, **kwargs):
    if created and instance.area_laboratorio:
        try:
            plantillas = RequisitoCatalogo.objects.filter(area=instance.area_laboratorio)
            if plantillas.exists():
                items_to_create = []
                for req in plantillas:
                    items_to_create.append(ChecklistItem(
                        consulta=instance,
                        area=instance.area_laboratorio.nombre,
                        requisito=req.pregunta,
                        normativa_aplicable=req.normativa_aplicable
                    ))
                ChecklistItem.objects.bulk_create(items_to_create)
        except Exception as e:
            print(f"Error generando checklist desde catálogo: {e}")