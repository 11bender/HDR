from .views import ServerDigitViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'digits',ServerDigitViewSet)
urlpatterns = router.urls
