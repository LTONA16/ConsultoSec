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

class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.all()
    serializer_class = ChecklistItemSerializer

class CapacitacionViewSet(viewsets.ModelViewSet):
    queryset = Capacitacion.objects.all()
    serializer_class = CapacitacionSerializer