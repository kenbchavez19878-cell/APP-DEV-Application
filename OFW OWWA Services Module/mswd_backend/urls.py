from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core_profiles.views import OFWRegistrationViewSet, OWWAOfficerProfileViewSet, LoginView

# Automatically generate API endpoints
router = DefaultRouter()
router.register(r'ofw-registrations', OFWRegistrationViewSet)
router.register(r'officer-profiles', OWWAOfficerProfileViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/', include(router.urls)),  # Mounts your API links under http://127.0.0.1:8000/api/
]