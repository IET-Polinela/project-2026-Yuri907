from django.urls import path
from .views import UserLoginView, UserLogoutView, register
from .api_views import RegisterView


urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('register/', register, name='register'),

    # API Register
    path('api/register/', RegisterView.as_view(), name='api_register'),
]