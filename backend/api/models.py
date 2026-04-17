from django.db import models

class Debtor(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="Имя должника")

    def __str__(self):
        return self.name

class Debt(models.Model):
    # Добавляем выбор валюты
    CURRENCY_CHOICES = [
        ('UZS', 'Сум'),
        ('USD', 'Доллар'),
    ]
    
    debtor = models.ForeignKey(Debtor, on_delete=models.CASCADE, related_name='debts')
    reason = models.TextField(blank=True, null=True, verbose_name="Причина")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='UZS') # Новое поле
    date = models.DateField()
    debtor = models.ForeignKey(Debtor, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.amount} {self.currency} - {self.debtor.name}"