from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserCreateSerializer
from .permissions import IsAdminRole, IsAdminOrSelf
from .serializers import ConsultorSerializer

User = get_user_model()

class UserListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar y crear usuarios.
    Solo accesible para usuarios con el rol ADMIN.
    """
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdminRole]

class ConsultoresListView(generics.ListAPIView):
    """
    Endpoint público (cualquier usuario autenticado) que devuelve
    únicamente los usuarios con rol CONSULTOR y activos.
    Usado para poblar selectores de asistentes en Capacitaciones.
    """
    serializer_class = ConsultorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        User = get_user_model()
        return User.objects.filter(role='CONSULTOR', is_active=True).order_by('first_name', 'last_name')

class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para obtener, actualizar o desactivar (modificar) un usuario específico por su ID.
    Solo accesible para usuarios con el rol ADMIN.
    """
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdminOrSelf]

class UserMeView(APIView):
    """
    Endpoint para obtener la información del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = UserCreateSerializer(user)
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        })
