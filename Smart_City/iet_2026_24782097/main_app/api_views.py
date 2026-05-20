from rest_framework import viewsets, permissions
from django.db.models import Q

from .models import Report
from .serializers import ReportSerializer
from .permissions import *


class ReportViewSet(viewsets.ModelViewSet):

    serializer_class = ReportSerializer

    def get_queryset(self):

        user = self.request.user

        # Admin hanya lihat non-draft
        if user.is_staff:
            return Report.objects.exclude(status='DRAFT')

        # Citizen lihat non-draft + draft sendiri
        return Report.objects.filter(
            ~Q(status='DRAFT') |
            Q(reporter=user)
        )

    def get_permissions(self):

        if self.action in ['update', 'partial_update', 'destroy']:
            return [
                permissions.IsAuthenticated(),
                IsOwnerAndDraftOrReadOnly()
            ]

        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):

        serializer.save(reporter=self.request.user)