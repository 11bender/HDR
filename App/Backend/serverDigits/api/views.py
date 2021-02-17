from rest_framework import viewsets
from ..models import ServerDigit
from .serializers import ServerDigitSerializer

class ServerDigitViewSet(viewsets.ModelViewSet):
    serializer_class = ServerDigitSerializer
    queryset = ServerDigit.objects.all()