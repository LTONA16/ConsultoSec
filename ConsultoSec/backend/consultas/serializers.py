from rest_framework import serializers
from .models import Consulta, ChecklistItem, AreaCatalogo, RequisitoCatalogo, Capacitacion


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

    class Meta:
        model = Consulta
        fields = '__all__'

class CapacitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Capacitacion
        fields = '__all__'