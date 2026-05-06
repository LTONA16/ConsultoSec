from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

class AreaCatalogo(models.Model):
    nombre = models.CharField(max_length=150, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre

class RequisitoCatalogo(models.Model):
    area = models.ForeignKey(AreaCatalogo, on_delete=models.CASCADE, related_name='requisitos')
    categoria = models.CharField(max_length=150, default='General')
    pregunta = models.TextField()
    normativa_aplicable = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['id']

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
    fecha_finalizacion_propuesta = models.DateTimeField(null=True, blank=True)

    eliminado = models.BooleanField(default=False, help_text="Eliminado lógico")

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
    categoria = models.CharField(max_length=150, default='General')
    requisito = models.TextField()
    normativa_aplicable = models.CharField(max_length=255, null=True, blank=True)
    
    cumple = models.CharField(max_length=20, choices=CUMPLE_CHOICES, default='no_evaluado')
    observacion = models.TextField(blank=True)
    mejora = models.TextField(blank=True)
    comentarios = models.TextField(blank=True)
    imagen = models.ImageField(upload_to='consultosec/checklists/%Y/%m/%d/', null=True, blank=True)

    class Meta:
        ordering = ['id']

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
                        categoria=req.categoria,
                        requisito=req.pregunta,
                        normativa_aplicable=req.normativa_aplicable
                    ))
                ChecklistItem.objects.bulk_create(items_to_create)
        except Exception as e:
            print(f"Error generando checklist desde catálogo: {e}")

class PropuestaMejora(models.Model):
    PLAZO_CHOICES = [
        ('corto', 'Corto Plazo'),
        ('mediano', 'Mediano Plazo'),
        ('largo', 'Largo Plazo'),
    ]
    ESTADO_CHOICES = [
        ('completado', 'Completado'),
        ('en_proceso', 'En proceso'),
        ('requiere_adquisicion', 'Requiere adquisición de insumos o presupuesto por parte del departamento'),
        ('requiere_instalacion', 'Requiere instalación por parte de mantenimiento'),
    ]
    S_CHOICES = [
        ('clasificar', 'Clasificar'),
        ('ordenar', 'Ordenar'),
        ('limpiar', 'Limpiar'),
        ('estandarizar', 'Estandarizar'),
        ('disciplina', 'Disciplina'),
    ]
    APROBACION_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    ]

    consulta = models.ForeignKey(
        Consulta, 
        on_delete=models.CASCADE, 
        related_name='propuestas_mejora'
    )
    plazo = models.CharField(max_length=10, choices=PLAZO_CHOICES, default='corto')
    numero_tarea = models.CharField(max_length=10, default='', help_text="Ej: 1.1, 2.3")
    accion_correctiva = models.TextField(default='', help_text="Descripción de la acción correctiva")
    responsables = models.JSONField(default=list, help_text="Lista de responsables seleccionados")
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    s_implementada = models.CharField(max_length=20, choices=S_CHOICES, blank=True)
    estado = models.CharField(
        max_length=30, 
        choices=ESTADO_CHOICES, 
        default='en_proceso'
    )
    aprobacion = models.CharField(
        max_length=15, 
        choices=APROBACION_CHOICES, 
        default='pendiente'
    )
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['plazo', 'numero_tarea']

    @property
    def duracion_dias(self):
        if self.fecha_inicio and self.fecha_fin:
            return (self.fecha_fin - self.fecha_inicio).days
        return 0

    def __str__(self):
        return f"Propuesta #{self.pk} - {self.get_plazo_display()} ({self.numero_tarea})"

class Capacitacion(models.Model):
    consultas = models.ManyToManyField(Consulta, related_name='capacitaciones', blank=True)
    laboratorios = models.ManyToManyField(AreaCatalogo, related_name='capacitaciones_asignadas', blank=True)
    tema = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    fecha = models.DateField()
    responsable = models.CharField(max_length=255)
    asistentes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='capacitaciones_asistidas', blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Capacitación: {self.tema} - {self.fecha}"


class CapacitacionArchivo(models.Model):
    TIPO_CHOICES = [
        ('material', 'Material'),
        ('evidencia', 'Evidencia'),
    ]
    capacitacion = models.ForeignKey(
        Capacitacion,
        on_delete=models.CASCADE,
        related_name='archivos'
    )
    archivo = models.FileField(upload_to='consultosec/capacitaciones/%Y/%m/%d/')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='material')
    nombre = models.CharField(max_length=255, blank=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.nombre or self.archivo.name}"


@receiver(post_delete, sender=CapacitacionArchivo)
def eliminar_archivo_disco(sender, instance, **kwargs):
    """Borra el archivo físico del disco cuando se elimina el registro."""
    if instance.archivo and instance.archivo.name:
        import os
        try:
            if os.path.isfile(instance.archivo.path):
                os.remove(instance.archivo.path)
        except Exception as e:
            print(f"No se pudo eliminar el archivo del disco: {e}")

