from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):

    reporter = serializers.SerializerMethodField()
    reporter_name = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'title',
            'category',
            'description',
            'location',
            'status',
            'reporter',
            'reporter_name',
            'created_at',
            'updated_at',
            'is_owner'
        ]

    def get_reporter(self, obj):
        request = self.context.get("request")

        # Untuk laporan milik sendiri tampilkan username
        if (
            request and
            request.user and
            request.user.is_authenticated and
            obj.reporter == request.user
        ):
            return obj.reporter.username

        # Selain itu tetap anonim
        return "Warga Anonim"

    def get_reporter_name(self, obj):
        request = self.context.get("request")

        # Tidak ada request context
        if not request:
            return "Warga Anonim"

        # Pemilik laporan
        if (
            request.user and
            request.user.is_authenticated and
            obj.reporter == request.user
        ):
            return obj.reporter.username

        # Orang lain
        return "Warga Anonim"


    def get_is_owner(self, obj):
        
        request = self.context.get("request")

        if (
            request and
            request.user and
            request.user.is_authenticated
        ):
            return obj.reporter == request.user

        return False