from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

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
]