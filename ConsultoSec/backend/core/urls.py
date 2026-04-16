from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # 1. Endpoint que genera el archivo JSON/YAML con toda tu API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    # 2. Endpoint de la interfaz gráfica (Swagger UI) que lee el esquema anterior
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    path('api/', include('consultas.urls')),
    path('api/users/', include('users.urls')),
]