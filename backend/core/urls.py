from django.contrib import admin
from django.urls import path
from api.views import DebtorSearchAPIView, AddDebtView, AllDebtorsAPIView # Импортируй новый View

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/search/', DebtorSearchAPIView.as_view()),
    path('api/add-debt/', AddDebtView.as_view()), # ВОТ ЭТА СТРОКА ИСПРАВИТ 404
    path('api/all/', AllDebtorsAPIView.as_view()),
]