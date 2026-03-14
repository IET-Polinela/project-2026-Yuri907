from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def welcome(request):
    return HttpResponse("Selamat Datang Yuri Elva")

urlpatterns = [
    path('', include('main_app.urls')),   # Home
    path('about/', include('about.urls')), 
    path('contacts/', include('contacts.urls')),
    path('welcome/', welcome),
    path('admin/', admin.site.urls),
]