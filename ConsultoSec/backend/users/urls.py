from django.urls import path
from .views import UserListCreateView, UserDetailView, UserMeView, ConsultoresListView

urlpatterns = [
    path('me/', UserMeView.as_view(), name='user-me'),
    path('consultores/', ConsultoresListView.as_view(), name='user-consultores'),
    path('', UserListCreateView.as_view(), name='user-list-create'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
