from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.views import View
from django.urls import reverse_lazy
from .models import Report
from .forms import ReportForm
from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin


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


class ReportCreateView(SuccessMessageMixin, CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'yurielva_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil ditambahkan")
        return super().form_valid(form)


class ReportUpdateView(SuccessMessageMixin, UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'yurielva_app/update_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.info(self.request, "Laporan berhasil diperbarui")
        return super().form_valid(form)


class ReportDeleteView(DeleteView):
    model = Report
    template_name = 'yurielva_app/delete_report.html'
    success_url = reverse_lazy('report_list')

    def post(self, request, *args, **kwargs):
        messages.error(self.request, "Laporan berhasil dihapus")
        return super().post(request, *args, **kwargs)


class ReportUpdateStatusView(View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')
        report.status = new_status
        report.save()

        messages.warning(request, "Status laporan berhasil diperbarui")

        return redirect('report_list')