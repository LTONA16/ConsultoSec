from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Consulta, ChecklistItem, AreaCatalogo, PropuestaMejora, RequisitoCatalogo, Actividad
from .serializers import ConsultaSerializer, ChecklistItemSerializer, AreaCatalogoSerializer, RequisitoCatalogoSerializer, SolicitudCreateSerializer, PropuestaMejoraSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import viewsets
from .models import Consulta, ChecklistItem, AreaCatalogo, RequisitoCatalogo, Capacitacion
from .serializers import ConsultaSerializer, ChecklistItemSerializer, AreaCatalogoSerializer, RequisitoCatalogoSerializer, CapacitacionSerializer

class AreaCatalogoViewSet(viewsets.ModelViewSet):
    queryset = AreaCatalogo.objects.all()
    serializer_class = AreaCatalogoSerializer

class RequisitoCatalogoViewSet(viewsets.ModelViewSet):
    queryset = RequisitoCatalogo.objects.all()
    serializer_class = RequisitoCatalogoSerializer

class ConsultaViewSet(viewsets.ModelViewSet):
    queryset = Consulta.objects.all()
    
    def get_serializer_class(self):
        # Si la petición es POST, usa el serializador con los campos definidos
        if self.action == 'create':
            return SolicitudCreateSerializer
        # Para GET, PUT, PATCH, usa el serializador completo con los items anidados
        return ConsultaSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Consulta.objects.none()
            
        # Administradores y superusuarios ven todas las auditorías
        if user.is_superuser or getattr(user, 'role', '') == 'ADMIN':
            return Consulta.objects.all()
            
        # Consultores solo ven las auditorías en las que están asignados como responsables
        return Consulta.objects.filter(responsables=user).distinct()

class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.all()
    serializer_class = ChecklistItemSerializer

class PropuestaMejoraViewSet(viewsets.ModelViewSet):
    queryset = PropuestaMejora.objects.all()
    serializer_class = PropuestaMejoraSerializer

    # Esta sección habilita el campo en la interfaz de Swagger
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="status", 
                description="Filtrar por estado. Use 'no_implementada' para ver propuestas rechazadas.", 
                required=False, 
                type=str
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        """
        Retorna la lista de propuestas, permitiendo filtrar por el parámetro 'status'.
        """
        return super().list(request, *args, **kwargs)

    # FILTRADO GET SCRUM-62
    def get_queryset(self):
        """
        Permite filtrar las propuestas usando query params.
        Ejemplo: /api/propuestas/?status=no_implementada
        """
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status', None)
        
        if status_param:
            if status_param == 'no_implementada':
                queryset = queryset.filter(estado='rechazada')
            else:
                queryset = queryset.filter(estado=status_param)
                
        return queryset


    # REVISIÓN PATCH SCRUM-59
    @action(detail=True, methods=['patch'], url_path='revisar')
    def revisar_propuesta(self, request, pk=None):
        """
        Endpoint: PATCH /api/propuestas/{id}/revisar/
        Recibe 'decision' (aprobado/rechazado) y 'motivoRechazo'.
        """
        propuesta = self.get_object()
        decision = request.data.get('decision')
        motivo_rechazo = request.data.get('motivoRechazo')

        # 1. Validar input básico
        if decision not in ['aprobado', 'rechazado']:
            return Response(
                {"error": "El campo 'decision' debe ser 'aprobado' o 'rechazado'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Validación SCRUM-59: Motivo obligatorio al rechazar
        if decision == 'rechazado':
            if not motivo_rechazo or str(motivo_rechazo).strip() == '':
                return Response(
                    {"motivoRechazo": "El motivo es obligatorio cuando se rechaza una propuesta."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            propuesta.estado = 'rechazada'
            propuesta.motivo_rechazo = motivo_rechazo
            # Si existía una actividad previa por una aprobación anterior, la eliminamos
            if hasattr(propuesta, 'actividad_vinculada'):
                propuesta.actividad_vinculada.delete()

        # 3. Trigger SCRUM-59: Lógica si se aprueba
        elif decision == 'aprobado':
            propuesta.estado = 'implementada'  # O 'en_revision' según tu flujo
            propuesta.motivo_rechazo = None # Limpiamos el motivo por si acaso
            
            # TRIGGER: Crear actividad si no existe una ya
            Actividad.objects.get_or_create(
                propuesta=propuesta,
                defaults={'descripcion': f"Ejecutar mejora: {propuesta.descripcion}"}
            )

        propuesta.save()
        
        serializer = self.get_serializer(propuesta)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # REVINCULACIÓN POST SCRUM-62
    @action(detail=True, methods=['post'], url_path='relink')
    def relink(self, request, pk=None):
        """
        Endpoint: POST /api/propuestas/{id}/relink/
        Toma una propuesta rechazada y la vincula a una nueva auditoría e ítem.
        """
        propuesta = self.get_object()
        
        nueva_consulta_id = request.data.get('nueva_consulta_id')
        nuevo_item_id = request.data.get('nuevo_item_id')

        # Validación de datos de entrada
        if not nueva_consulta_id or not nuevo_item_id:
            return Response(
                {"error": "Se requieren los campos 'nueva_consulta_id' y 'nuevo_item_id'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener las nuevas instancias
        nueva_consulta = get_object_or_404(Consulta, pk=nueva_consulta_id)
        nuevo_item = get_object_or_404(ChecklistItem, pk=nuevo_item_id)

        # Validación de integridad: El ítem debe pertenecer a la consulta indicada
        if nuevo_item.consulta != nueva_consulta:
            return Response(
                {"error": "El nuevo ítem no pertenece a la nueva auditoría especificada."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # El nuevo ítem también debe estar reprobado para poder recibir una propuesta
        if nuevo_item.cumple != 'no':
            return Response(
                {"error": "El nuevo ítem de destino debe estar marcado como 'No cumple'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ejecutar la revinculación
        propuesta.consulta = nueva_consulta
        propuesta.item_checklist = nuevo_item
        propuesta.estado = 'pendiente'  # Se reinicia el estado para que vuelva a ser evaluada
        propuesta.motivo_rechazo = None # Se limpia el motivo del rechazo anterior
        propuesta.save()

        serializer = self.get_serializer(propuesta)
        return Response(serializer.data, status=status.HTTP_200_OK)
class CapacitacionViewSet(viewsets.ModelViewSet):
    queryset = Capacitacion.objects.all()
    serializer_class = CapacitacionSerializer
