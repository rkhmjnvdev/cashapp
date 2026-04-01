from django.contrib import admin
from .models import Debtor, Debt

@admin.register(Debtor)
class DebtorAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Debt)
class DebtAdmin(admin.ModelAdmin):
    list_display = ('debtor', 'amount', 'currency', 'date')
    list_filter = ('currency', 'date')