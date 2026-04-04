from django.shortcuts import render, redirect
from .models import Report
from .forms import ReportForm

# HOME
def home(request):
    reports = Report.objects.all()
    return render(request, 'yurielva_app/home.html', {'reports': reports})


# CREATE
def add_report(request):
    if request.method == "POST":
        form = ReportForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
        else:
            print(form.errors)
    else:
        form = ReportForm()

    return render(request, 'yurielva_app/add_report.html', {'form': form})


# READ
def report_list(request):
    reports = Report.objects.all()
    return render(request, 'yurielva_app/report_list.html', {'reports': reports})


# UPDATE
def edit_report(request, id):
    report = Report.objects.get(id=id)

    if request.method == "POST":
        form = ReportForm(request.POST, instance=report)
        if form.is_valid():
            form.save()
            return redirect('report_list')
        else:
            print(form.errors)
    else:
        form = ReportForm(instance=report)

    return render(request, 'yurielva_app/update_report.html', {'form': form})


def delete_report(request, id):
    try:
        report = Report.objects.get(id=id)
    except Report.DoesNotExist:
        return redirect('report_list')

    if request.method == "POST":
        report.delete()
        return redirect('report_list')

    return render(request, 'yurielva_app/delete_report.html', {'report': report})