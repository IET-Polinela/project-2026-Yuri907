from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from .models import Report
from .serializers import ReportSerializer
from .permissions import IsOwnerAndDraftOrReadOnly
from drf_spectacular.utils import extend_schema


class ReportPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ReportViewSet(viewsets.ModelViewSet):

    serializer_class = ReportSerializer
    pagination_class = ReportPagination

    def get_queryset(self):

        user = self.request.user

        if not user.is_authenticated:
            return Report.objects.none()

        queryset = Report.objects.all().order_by("-updated_at")

        # Admin hanya melihat laporan selain DRAFT
        if user.is_staff:
            return queryset.exclude(status="DRAFT")

        tab = self.request.query_params.get("tab", None)

        if tab == "my_reports":
            return queryset.filter(reporter=user)

        if tab == "feed":
            return queryset.filter(
                ~Q(reporter=user),
                ~Q(status="DRAFT")
            )

        return queryset.filter(
            ~Q(status="DRAFT") |
            Q(status="DRAFT", reporter=user)
        )

    def get_permissions(self):

        if self.action in ["update", "partial_update", "destroy"]:
            return [
                permissions.IsAuthenticated(),
                IsOwnerAndDraftOrReadOnly()
            ]

        return [permissions.IsAuthenticated()]

    @extend_schema(exclude=True)
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):

        serializer.save(reporter=self.request.user)