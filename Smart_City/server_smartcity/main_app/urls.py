from django.urls import path
from .views import (
    home,
    report_search,
    report_detail_api,
    ReportListView,
    ReportCreateView,
    ReportUpdateView,
    ReportDeleteView,
    ReportDetailView,
    ReportUpdateStatusView,
    ReportDetailJsonView
)

urlpatterns = [
    path('', home, name='home'),
    path('reports/', ReportListView.as_view(), name='report_list'),
    path('reports/add/', ReportCreateView.as_view(), name='add_report'),
    path('reports/<int:pk>/', ReportDetailView.as_view(), name='detail_report'),
    path('report/<int:pk>/', ReportDetailView.as_view(), name='report_detail'),
    path('reports/<int:pk>/edit/', ReportUpdateView.as_view(), name='update_report'),
    path('reports/<int:pk>/delete/', ReportDeleteView.as_view(), name='delete_report'),
    path('reports/<int:pk>/status/', ReportUpdateStatusView.as_view(), name='update_status'),

    path('report/json/<int:pk>/', ReportDetailJsonView.as_view(), name='report_json'),

    path('report/search/', report_search, name='report_search'),
    path('report/api/<int:pk>/', report_detail_api, name='report_detail_api'),
]