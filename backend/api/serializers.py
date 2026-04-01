from rest_framework import serializers
from .models import Debtor, Debt

class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Debt
        fields = ['id', 'amount', 'currency', 'date', 'reason'] # 'reason' ОБЯЗАТЕЛЬНО должен быть здесь

class DebtorSerializer(serializers.ModelSerializer):
    # Убедись, что related_name в моделях совпадает с этим полем
    debts = DebtSerializer(many=True, read_only=True)

    class Meta:
        model = Debtor
        fields = ['id', 'name', 'debts']