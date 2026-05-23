from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
from core_profiles.views import OFWRegistrationViewSet, OWWAOfficerProfileViewSet, LoginView
=======
from core_profiles.views import OFWRegistrationViewSet, OWWAOfficerProfileViewSet, UserSettingsViewSet


def home_redirect(request):
    """Redirect the site root to the Django admin dashboard."""
    from django.shortcuts import redirect
    return redirect('/admin/')
>>>>>>> bb931591fb0c47657ad21439eea743bcc663a869

# Automatically generate API endpoints
router = DefaultRouter()
router.register(r'ofw-registrations', OFWRegistrationViewSet)
router.register(r'officer-profiles', OWWAOfficerProfileViewSet)
router.register(r'user-settings', UserSettingsViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/', include(router.urls)),  # Mounts your API links under http://127.0.0.1:8000/api/
    path('api/auth/', include('dj_rest_auth.urls')),  # Authentication endpoints
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),  # Registration endpoints
    path('', home_redirect, name='home'),  # Redirect root to admin
]