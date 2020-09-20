from django.contrib import admin
from django.urls import path,include

from api.move import MoveView

urlpatterns = [
    path('move/', MoveView.as_view()),
]
