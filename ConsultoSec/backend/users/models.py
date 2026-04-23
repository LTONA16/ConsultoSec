from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager

class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        # Asignamos el rol ADMIN automáticamente al crear un superusuario
        extra_fields.setdefault('role', 'ADMIN')

        return super().create_superuser(username, email, password, **extra_fields)

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        CONSULTOR = 'CONSULTOR', 'Consultor'
        
    role = models.CharField(
        max_length=50,
        choices=Role.choices,
        default=Role.CONSULTOR
    )

    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        # Aseguramos que si el usuario tiene rol ADMIN, pueda entrar al panel de Django
        if self.role == self.Role.ADMIN:
            self.is_staff = True
        else:
            self.is_staff = False
            # Si deja de ser admin, por seguridad removemos permisos de superusuario
            self.is_superuser = False
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
