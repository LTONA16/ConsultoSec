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
    serializer_class = ConsultaSerializer

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

class CapacitacionViewSet(viewsets.ModelViewSet):
    queryset = Capacitacion.objects.all()
    serializer_class = CapacitacionSerializer