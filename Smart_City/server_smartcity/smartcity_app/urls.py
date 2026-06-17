from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django_scalar.views import scalar_viewer

def welcome(request):
    return HttpResponse("Selamat Datang Yuri Elva")

urlpatterns = [
    path('', include('main_app.urls')),
    path('about/', include('about.urls')), 
    path('contacts/', include('contacts.urls')),
    path('', include('usermanagement_24782097.urls')), 
    path('welcome/', welcome),
    path('admin/', admin.site.urls),
    path('dashboard/', include('dashboard_24782097.urls')),
    path('api/', include('main_app.api_urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/docs/scalar/', scalar_viewer, name='scalar-ui'),
]