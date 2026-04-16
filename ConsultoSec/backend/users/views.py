from rest_framework import generics
from django.contrib.auth import get_user_model
from .serializers import UserCreateSerializer
from .permissions import IsAdminRole

User = get_user_model()

class UserListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar y crear usuarios.
    Solo accesible para usuarios con el rol ADMIN.
    """
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdminRole]

class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para obtener, actualizar o desactivar (modificar) un usuario específico por su ID.
    Solo accesible para usuarios con el rol ADMIN.
    """
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdminRole]
