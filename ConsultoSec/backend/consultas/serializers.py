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

    class Meta:
        model = Consulta
        fields = '__all__'

class SolicitudCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consulta
        # Definimos los campos que el Frontend puede enviar al crear
        fields = ['id', 'area_laboratorio', 'notas', 'responsables']
        
    def validate_area_laboratorio(self, value):
        """
        Validación personalizada: Asegura que siempre se envíe un área 
        para que el signal 'generar_checklist' funcione correctamente.
        """
        if not value:
            raise serializers.ValidationError("El área de laboratorio es obligatoria para procesar la solicitud.")
        return value