from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import Debtor, Debt
from .serializers import DebtorSerializer, DebtSerializer
from rest_framework import generics

class DebtorSearchAPIView(ListAPIView):
    serializer_class = DebtorSerializer

    def get_queryset(self):
        name = self.request.query_params.get('name')
        if name:
            return Debtor.objects.filter(name__icontains=name)
        return Debtor.objects.none()

class AddDebtView(APIView):
    def post(self, request):
        try:
            # 1. Извлекаем данные из запроса (Добавили reason!)
            name = request.data.get('name')
            amount = request.data.get('amount')
            currency = request.data.get('currency')
            date = request.data.get('date')
            reason = request.data.get('reason') # Теперь причина не будет null

            # 2. Проверка на пустые поля
            if not all([name, amount, date]):
                return Response({"error": "Заполните обязательные поля (имя, сумма, дата)!"}, status=status.HTTP_400_BAD_REQUEST)

            # 3. Логика сохранения
            debtor, created = Debtor.objects.get_or_create(name=name)
            
            # Создаем запись долга с указанием причины
            Debt.objects.create(
                debtor=debtor,
                amount=amount,
                currency=currency if currency else 'UZS',
                date=date,
                reason=reason # Данные записываются в базу
            )
            
            return Response({"status": "success", "message": "Долг добавлен"}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            # Печать ошибки в консоль сервера для отладки
            print(f"ОШИБКА СОХРАНЕНИЯ: {e}") 
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AllDebtorsAPIView(generics.ListAPIView):
    queryset = Debtor.objects.all()
    serializer_class = DebtorSerializer