from django.shortcuts import render

def home(request):
    return render(request, 'yurielva_app/home.html')