from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultaViewSet, ChecklistItemViewSet, AreaCatalogoViewSet, PropuestaMejoraViewSet, RequisitoCatalogoViewSet, CapacitacionViewSet, CapacitacionArchivoViewSet, upload_checklist_item_photo

router = DefaultRouter()
router.register(r'areas-laboratorio', AreaCatalogoViewSet)
router.register(r'requisitos-laboratorio', RequisitoCatalogoViewSet)
router.register(r'solicitudes', ConsultaViewSet, basename='solicitudes')
router.register(r'checklists', ChecklistItemViewSet)
router.register(r'propuestas', PropuestaMejoraViewSet)
router.register(r'capacitaciones', CapacitacionViewSet)
router.register(r'capacitacion-archivos', CapacitacionArchivoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('checklist/items/<int:item_id>/photos/', upload_checklist_item_photo),
]