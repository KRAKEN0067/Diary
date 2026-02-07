from django.urls import path
from . import views

urlpatterns = [
    path('api/calendar/', views.calender_view, name='calender_view'),
    path('api/save_content/',views.add_content, name="add_content"),
    path('api/get_content/', views.get_content_by_date),
]
