from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultaViewSet, ChecklistItemViewSet, AreaCatalogoViewSet, PropuestaMejoraViewSet, RequisitoCatalogoViewSet

# El router crea automáticamente las URLs para nuestro ViewSet
router = DefaultRouter()
router.register(r'areas-laboratorio', AreaCatalogoViewSet)
router.register(r'requisitos-laboratorio', RequisitoCatalogoViewSet)
#router.register(r'consultas', ConsultaViewSet)
router.register(r'solicitudes', ConsultaViewSet, basename='solicitudes')
router.register(r'checklists', ChecklistItemViewSet)
router.register(r'propuestas', PropuestaMejoraViewSet)

urlpatterns = [
    path('', include(router.urls)),
]