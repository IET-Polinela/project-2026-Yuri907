from rest_framework import generics, permissions
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer