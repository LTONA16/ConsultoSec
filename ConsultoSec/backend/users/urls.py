from django.urls import path
from .views import UserListCreateView, UserDetailView, UserMeView

urlpatterns = [
    path('me/', UserMeView.as_view(), name='user-me'),
    path('', UserListCreateView.as_view(), name='user-list-create'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
