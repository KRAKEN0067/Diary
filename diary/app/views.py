from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

import calendar
from datetime import date, datetime

from .models import DiaryEntry



def _calendar_context(for_date: date):
    year = for_date.year
    month = for_date.month

    month_num_map = {
        1: "january",
        2: "february",
        3: "march",
        4: "april",
        5: "may",
        6: "june",
        7: "july",
        8: "august",
        9: "september",
        10: "october",
        11: "november",
        12: "december",
    }
    day_today = date.today().day
    cal = calendar.monthcalendar(year, month)
    entries = DiaryEntry.objects.all()
    entry_dates = [entry.date.day for entry in entries if entry.date.month == month and entry.date.year == year]

    return {
        "day_today": day_today,
        "calendar": cal,
        "month": month_num_map[month],
        "year": year,
        "entry_dates": entry_dates,
    }


@csrf_exempt
def calender_view(request):
    """JSON API endpoint."""

    month_num_map = {
        1: "january",
        2: "february",
        3: "march",
        4: "april",
        5: "may",
        6: "june",
        7: "july",
        8: "august",
        9: "september",
        10: "october",
        11: "november",
        12: "december",
    }

    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except Exception:
            return JsonResponse({"error": "invalid json"}, status=400)

        # Accept either numeric month (1-12) or month name
        raw_month = data.get("month")
        year = data.get("year")

        if year is None:
            return JsonResponse({"error": "year required"}, status=400)

        try:
            year_int = int(year)
        except (ValueError, TypeError):
            return JsonResponse({"error": "invalid year"}, status=400)

        month_int = None
        if isinstance(raw_month, int):
            month_int = raw_month
        else:
            try:
                month_int = int(raw_month)
            except (ValueError, TypeError):
                # try name -> number
                name_map = {v: k for k, v in month_num_map.items()}
                if isinstance(raw_month, str):
                    month_int = name_map.get(raw_month.lower())

        if not month_int or not (1 <= month_int <= 12):
            return JsonResponse({"error": "invalid month"}, status=400)

        cal = calendar.monthcalendar(year_int, month_int)

        entries = DiaryEntry.objects.all()
        entry_dates = [entry.date.day for entry in entries if entry.date.month == month_int and entry.date.year == year]

        context = {
            "day_today": date.today().day if year_int == date.today().year and month_int == date.today().month else None,
            "calendar": cal,
            "month": month_num_map[month_int],
            "year": year_int,
            "entry_dates": entry_dates,
        }

    else:
        context = _calendar_context(date.today())

    return JsonResponse(context)




def get_content_by_date(request):
    date_str = request.GET.get("date")

    if not date_str:
        return JsonResponse({"error":"Date required"}, status=400)
    entries = DiaryEntry.objects.filter(date = date_str).order_by("-id")

    combined_content = "\n\n".join(entry.content for entry in entries)


    
    
    return JsonResponse({"content":combined_content})

@csrf_exempt
def add_content(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print("PARSED DATA:", data)

        entry_date = data.get("date")
        content = (data.get("content") or "").strip()

        if not entry_date:
            return JsonResponse(
                {"error": "Date and content are required"},
                status=400
            )
        
        if content == "":
            deleted_count, _ = DiaryEntry.objects.filter(date = entry_date).delete()
            return JsonResponse({"message":"All entries deleted"}, status=200)

        DiaryEntry.objects.update_or_create(
            date=entry_date,
            content = content
        )

        return JsonResponse({"message": "Saved"})

def next_month(request):
    month = request.GET.get("month")
    year = request.GET.get("year")

    if not month or not year:
        return JsonResponse({"error": "month and year required"}, status=400)

    try:
        month_int = int(month)
    except (ValueError, TypeError):
        name_to_num = {
            "january": 1, "february": 2, "march": 3, "april": 4,
            "may": 5, "june": 6, "july": 7, "august": 8,
            "september": 9, "october": 10, "november": 11, "december": 12,
        }
        month_int = name_to_num.get(month.lower())
        if month_int is None:
            return JsonResponse({"error": "invalid month"}, status=400)

    try:
        year_int = int(year)
    except (ValueError, TypeError):
        return JsonResponse({"error": "invalid year"}, status=400)

    if month_int == 12:
        next_month_num = 1
        next_year = year_int + 1
    else:
        next_month_num = month_int + 1
        next_year = year_int

    context = _calendar_context(date(next_year, next_month_num, 1))
    return JsonResponse(context)


def prev_month(request):
    month = request.GET.get("month")
    year = request.GET.get("year")

    if not month or not year:
        return JsonResponse({"error": "month and year required"}, status=400)

    try:
        month_int = int(month)
    except (ValueError, TypeError):
        name_to_num = {
            "january": 1, "february": 2, "march": 3, "april": 4,
            "may": 5, "june": 6, "july": 7, "august": 8,
            "september": 9, "october": 10, "november": 11, "december": 12,
        }
        month_int = name_to_num.get(month.lower())
        if month_int is None:
            return JsonResponse({"error": "invalid month"}, status=400)

    try:
        year_int = int(year)
    except (ValueError, TypeError):
        return JsonResponse({"error": "invalid year"}, status=400)

    if month_int == 1:
        prev_month_num = 12
        prev_year = year_int - 1
    else:
        prev_month_num = month_int - 1
        prev_year = year_int

    context = _calendar_context(date(prev_year, prev_month_num, 1))
    return JsonResponse(context)



    





