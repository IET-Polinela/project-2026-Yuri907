from django.views.generic import TemplateView, View
from django.http import JsonResponse
from django.db.models import Count
from main_app.models import Report


# Dashboard utama
class DashboardView(TemplateView):
    template_name = 'dashboard/dashboard.html'

class DashboardDataView(View):
    def get(self, request, *args, **kwargs):

        # Chart Status
        status_data = (
            Report.objects
            .values('status')
            .annotate(total=Count('id'))
        )

        # Chart Category
        category_data = (
            Report.objects
            .values('category')
            .annotate(total=Count('id'))
        )

        # 5 laporan terbaru
        reported = (
            Report.objects
            .filter(status='REPORTED')
            .values('title', 'category', 'status')[:5]
        )

        # 5 laporan selesai
        resolved = (
            Report.objects
            .filter(status='RESOLVED')
            .values('title', 'category', 'status')[:5]
        )

        return JsonResponse({
            'status': list(status_data),
            'category': list(category_data),
            'reported': list(reported),
            'resolved': list(resolved),
        })