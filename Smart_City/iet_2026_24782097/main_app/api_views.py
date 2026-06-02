from rest_framework import viewsets, permissions
from django.db.models import Q

from .models import Report
from .serializers import ReportSerializer
from .permissions import IsOwnerAndDraftOrReadOnly


class ReportViewSet(viewsets.ModelViewSet):

    serializer_class = ReportSerializer

    def get_queryset(self):

        user = self.request.user

        if not user.is_authenticated:
            return Report.objects.none()

        # Admin hanya melihat laporan selain DRAFT
        if user.is_staff:
            return Report.objects.exclude(status='DRAFT')

        # Citizen hanya melihat laporan miliknya sendiri
        return Report.objects.filter(reporter=user)

    def get_permissions(self):

        if self.action in ['update', 'partial_update', 'destroy']:
            return [
                permissions.IsAuthenticated(),
                IsOwnerAndDraftOrReadOnly()
            ]

        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):

        serializer.save(reporter=self.request.user)