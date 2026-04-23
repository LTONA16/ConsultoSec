from rest_framework import viewsets
from .models import Consulta, ChecklistItem, AreaCatalogo, PropuestaMejora, RequisitoCatalogo
from .serializers import ConsultaSerializer, ChecklistItemSerializer, AreaCatalogoSerializer, RequisitoCatalogoSerializer, SolicitudCreateSerializer, PropuestaMejoraSerializer

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

class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.all()
    serializer_class = ChecklistItemSerializer

class PropuestaMejoraViewSet(viewsets.ModelViewSet):
    queryset = PropuestaMejora.objects.all()
    serializer_class = PropuestaMejoraSerializer

