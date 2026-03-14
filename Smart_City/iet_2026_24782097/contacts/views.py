from django.shortcuts import render

def contacts(request):
    return render(request, 'yurielva_contacts/contacts.html')