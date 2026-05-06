from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Consulta, ChecklistItem, AreaCatalogo, PropuestaMejora, RequisitoCatalogo, Capacitacion, CapacitacionArchivo
from .serializers import ConsultaSerializer, ChecklistItemSerializer, AreaCatalogoSerializer, RequisitoCatalogoSerializer, SolicitudCreateSerializer, PropuestaMejoraSerializer, CapacitacionSerializer, CapacitacionArchivoSerializer

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
            return Consulta.objects.filter(eliminado=False)
            
        # Consultores solo ven las auditorías en las que están asignados como responsables
        return Consulta.objects.filter(responsables=user, eliminado=False).distinct()

    @action(detail=True, methods=['patch'], url_path='eliminar')
    def eliminar_logico(self, request, pk=None):
        consulta = self.get_object()
        consulta.eliminado = True
        consulta.save(update_fields=['eliminado'])
        return Response({'status': 'eliminado'})

class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.all()
    serializer_class = ChecklistItemSerializer

class PropuestaMejoraViewSet(viewsets.ModelViewSet):
    queryset = PropuestaMejora.objects.all()
    serializer_class = PropuestaMejoraSerializer

    def get_queryset(self):
        """
        Permite filtrar las propuestas usando query params.
        Ejemplo: /api/propuestas/?consulta=5
                 /api/propuestas/?plazo=corto
        """
        queryset = super().get_queryset()
        consulta_param = self.request.query_params.get('consulta', None)
        plazo_param = self.request.query_params.get('plazo', None)
        
        if consulta_param:
            queryset = queryset.filter(consulta_id=consulta_param)
        if plazo_param:
            queryset = queryset.filter(plazo=plazo_param)
                
        return queryset

class CapacitacionViewSet(viewsets.ModelViewSet):
    queryset = Capacitacion.objects.all()
    serializer_class = CapacitacionSerializer

class CapacitacionArchivoViewSet(viewsets.ModelViewSet):
    queryset = CapacitacionArchivo.objects.all()
    serializer_class = CapacitacionArchivoSerializer

