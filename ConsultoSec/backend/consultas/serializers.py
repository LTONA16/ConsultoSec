from rest_framework import serializers
from .models import Consulta, ChecklistItem, AreaCatalogo, RequisitoCatalogo

class AreaCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaCatalogo
        fields = '__all__'

class RequisitoCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequisitoCatalogo
        fields = '__all__'

class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = '__all__'

class ConsultaSerializer(serializers.ModelSerializer):
    items_checklist = ChecklistItemSerializer(many=True, read_only=True)
    area_nombre = serializers.ReadOnlyField(source='area_laboratorio.nombre')

    class Meta:
        model = Consulta
        fields = '__all__'