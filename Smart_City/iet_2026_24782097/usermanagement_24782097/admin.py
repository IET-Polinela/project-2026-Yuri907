from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = (
        'username',
        'email',
        'is_admin',
        'is_member',
        'is_staff',
    )

    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {
            'fields': (
                'is_admin',
                'is_member',
            )
        }),
    )