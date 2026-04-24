from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """
    Permite acceso solo a usuarios con el rol ADMIN.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsAdminOrSelf(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
        
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return obj == request.user
