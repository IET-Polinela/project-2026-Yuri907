from rest_framework import permissions


class IsOwnerAndDraftOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):

        # Semua user harus login
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):

        # GET, HEAD, OPTIONS boleh untuk user yang sudah lolos queryset
        if request.method in permissions.SAFE_METHODS:
            return True

        # Admin hanya boleh update status
        if request.user.is_staff:
            return request.method in ['PATCH', 'PUT']

        # Citizen hanya boleh edit/delete milik sendiri
        return (
            obj.reporter == request.user
            and obj.status == 'DRAFT'
        )