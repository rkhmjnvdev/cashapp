from rest_framework import serializers
from .models import Debtor, Debt

class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Debt
        fields = ['amount', 'reason', 'currency', 'date']

class DebtorSerializer(serializers.ModelSerializer):
    debts = DebtSerializer(many=True, read_only=True)

    class Meta:
        model = Debtor
        fields = ['id', 'name', 'debts']