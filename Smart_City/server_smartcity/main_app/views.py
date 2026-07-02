from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.views import View
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.db.models import Q
from .models import Report
from .forms import ReportForm
from django.contrib import messages
from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied

class AdminRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_admin:
            messages.error(
                request,
                'Akses dibatasi. Fitur ini hanya dapat digunakan oleh admin.'
            )
            return redirect('report_list')
        return super().dispatch(request, *args, **kwargs)


def report_detail_api(request, pk):
    report = get_object_or_404(Report, pk=pk)

    return JsonResponse({
        "id": report.id,
        "title": report.title,
        "category": report.category,
        "description": report.description,
        "location": report.location,
        "status": report.status,
    })


class ReportDetailJsonView(View):
    def get(self, request, pk):
        report = get_object_or_404(Report, pk=pk)

        return JsonResponse({
            'title': report.title,
            'category': report.category,
            'description': report.description,
            'location': report.location,
            'status': report.status,
        })


def report_search(request):

    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    if not request.user.is_admin:
        return HttpResponseForbidden()

    keyword = request.GET.get("q", "")

    reports = Report.objects.filter(
        Q(title__icontains=keyword) |
        Q(description__icontains=keyword)
    )

    return render(
        request,
        "main_app/report_list.html",
        {
            "reports": reports,
            "keyword": keyword,
        },
    )

def home(request):
    reports = Report.objects.all()
    return render(
        request,
        'main_app/home.html',
        {
            'reports': reports
        }
    )


class ReportListView(AdminRequiredMixin, ListView):
    model = Report
    template_name = 'main_app/report_list.html'
    context_object_name = 'reports'


class ReportDetailView(AdminRequiredMixin, DetailView):
    model = Report
    template_name = 'main_app/detail_report.html'
    context_object_name = 'report'


class ReportCreateView(AdminRequiredMixin, CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(
            self.request,
            "Laporan berhasil ditambahkan"
        )
        return super().form_valid(form)


class ReportUpdateView(AdminRequiredMixin, UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/update_report.html'
    success_url = reverse_lazy('report_list')

    def get_object(self, queryset=None):
        # Admin hanya boleh mengubah status laporan (lewat ReportUpdateStatusView),
        # bukan mengedit seluruh isi laporan secara langsung.
        raise PermissionDenied(
            "Admin tidak diizinkan mengedit laporan secara langsung. "
            "Gunakan fitur Update Status."
        )

    def form_valid(self, form):
        messages.info(
            self.request,
            "Laporan berhasil diperbarui"
        )
        return super().form_valid(form)


class ReportDeleteView(AdminRequiredMixin, DeleteView):
    model = Report
    template_name = 'main_app/delete_report.html'
    success_url = reverse_lazy('report_list')

    def get_object(self, queryset=None):
        # Penghapusan laporan langsung tidak diizinkan untuk admin maupun citizen.
        raise PermissionDenied(
            "Laporan tidak dapat dihapus secara langsung."
        )

    def post(self, request, *args, **kwargs):
        messages.error(
            self.request,
            "Laporan berhasil dihapus"
        )
        return super().post(request, *args, **kwargs)


class ReportUpdateStatusView(AdminRequiredMixin, View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)

        new_status = request.POST.get('status')

        report.status = new_status
        report.save()

        messages.warning(
            request,
            "Status laporan berhasil diperbarui"
        )

        return redirect('report_list')