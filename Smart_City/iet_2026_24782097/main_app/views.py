from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.views import View
from django.urls import reverse_lazy
from .models import Report
from .forms import ReportForm


def home(request):
    reports = Report.objects.all()
    return render(request, 'yurielva_app/home.html', {'reports': reports})


class ReportListView(ListView):
    model = Report
    template_name = 'yurielva_app/report_list.html'
    context_object_name = 'reports'


class ReportDetailView(DetailView):
    model = Report
    template_name = 'yurielva_app/detail_report.html'
    context_object_name = 'report'


class ReportCreateView(CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'yurielva_app/add_report.html'
    success_url = reverse_lazy('report_list')


class ReportUpdateView(UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'yurielva_app/update_report.html'
    success_url = reverse_lazy('report_list')


class ReportDeleteView(DeleteView):
    model = Report
    template_name = 'yurielva_app/delete_report.html'
    success_url = reverse_lazy('report_list')


class ReportUpdateStatusView(View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')
        report.status = new_status
        report.save()
        return redirect('report_list')