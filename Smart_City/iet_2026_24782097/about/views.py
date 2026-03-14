from django.shortcuts import render

def about(request):
    return render(request, 'yurielva_about/about.html')