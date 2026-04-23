from rest_framework import viewsets
from .models import Consulta, ChecklistItem, AreaCatalogo, RequisitoCatalogo
from .serializers import ConsultaSerializer, ChecklistItemSerializer, AreaCatalogoSerializer, RequisitoCatalogoSerializer

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