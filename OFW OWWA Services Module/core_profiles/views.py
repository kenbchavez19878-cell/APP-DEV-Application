from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import OFWRegistration, OWWAOfficerProfile, UserSettings, PasswordChangeHistory
from .serializers import OFWRegistrationSerializer, OWWAOfficerProfileSerializer, UserSettingsSerializer, PasswordChangeHistorySerializer

class OFWRegistrationViewSet(viewsets.ModelViewSet):
    queryset = OFWRegistration.objects.all()
    serializer_class = OFWRegistrationSerializer

class OWWAOfficerProfileViewSet(viewsets.ModelViewSet):
    queryset = OWWAOfficerProfile.objects.all()
    serializer_class = OWWAOfficerProfileSerializer

class UserSettingsViewSet(viewsets.ModelViewSet):
    """
    Per-user settings endpoint.

    list / GET  /api/user-settings/          – settings for the current authenticated user
    create / POST /api/user-settings/        – create (first-time) or update settings (upsert)
    retrieve / GET  /api/user-settings/{id}/  – all settings (same as list)
    partial_update / PATCH /api/user-settings/{id}/  – partial update
    update / PUT /api/user-settings/{id}/    – full update

    Custom actions:
    PUT /api/user-settings/me/               – upsert for current user (no id needed)
    PUT /api/user-settings/me/profile/       – update profile fields only
    PUT /api/user-settings/me/security/      – update security fields only (no-password variant)
    PUT /api/user-settings/me/password/      – change password (+ record in history)
    PUT /api/user-settings/me/notifications/ – update notification toggles
    PUT /api/user-settings/me/preferences/   – update preferences
    PUT /api/user-settings/me/privacy/       – update privacy settings
    GET /api/user-settings/me/password-history/ – get password change history
    """
    queryset             = UserSettings.objects.all()
    serializer_class     = UserSettingsSerializer
    lookup_field         = "pk"
    lookup_url_kwarg     = "pk"

    def _get_or_create_settings(self, user):
        settings, _ = UserSettings.objects.get_or_create(user=user)
        return settings

    def list(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        obj = self._get_or_create_settings(request.user)
        ser = UserSettingsSerializer(obj)
        return Response(ser.data)

    def create(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        obj = self._get_or_create_settings(request.user)
        ser = UserSettingsSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        obj  = get_object_or_404(UserSettings, pk=kwargs.get("pk"), user=request.user)
        ser  = UserSettingsSerializer(obj)
        return Response(ser.data)

    def partial_update(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        obj  = get_object_or_404(UserSettings, pk=kwargs.get("pk"), user=request.user)
        ser  = UserSettingsSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def update(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    # ------------------------------------------------------------------
    # Convenience "me" actions – client never needs the integer PK
    # ------------------------------------------------------------------
    @action(detail=False, methods=["get", "put", "patch"], url_path="me")
    def me(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        obj = self._get_or_create_settings(request.user)
        if request.method in ("put", "patch"):
            ser = UserSettingsSerializer(obj, data=request.data, partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
            return Response(ser.data)
        return Response(UserSettingsSerializer(obj).data)

    # Profile update
    @action(
        detail=False, methods=["put"], url_path="me/profile",
        serializer_class=UserSettingsSerializer,
    )
    def update_profile(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        obj = self._get_or_create_settings(request.user)
        profile_fields = [
            "full_name", "email", "phone", "department",
            "position", "address", "bio",
        ]
        for f in profile_fields:
            if f in request.data:
                setattr(obj, f, request.data[f])
        obj.save()
        return Response(UserSettingsSerializer(obj).data)

    # Security update (no password)
    @action(detail=False, methods=["put"], url_path="me/security")
    def update_security(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        obj = self._get_or_create_settings(request.user)
        security_fields = ["two_factor_enabled", "session_timeout"]
        for f in security_fields:
            if f in request.data:
                setattr(obj, f, request.data[f])
        obj.save()
        return Response(UserSettingsSerializer(obj).data)

    # Password change
    @action(detail=False, methods=["put"], url_path="me/password")
    def change_password(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        if request.method != "PUT":
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

        old_pw = request.data.get("current_password", "")
        new_pw = request.data.get("new_password", "")

        if not request.user.check_password(old_pw):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_pw) < 8:
            return Response({"detail": "Password must be at least 8 characters long."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_pw)
        request.user.save()

        PasswordChangeHistory.objects.create(
            user      = request.user,
            ip_address= request.META.get("REMOTE_ADDR"),
            user_agent= request.META.get("HTTP_USER_AGENT", "")[:255],
        )

        return Response({"detail": "Password changed successfully."})

    # Notifications update
    @action(detail=False, methods=["put"], url_path="me/notifications")
    def update_notifications(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        obj = self._get_or_create_settings(request.user)
        notif_fields = [
            "email_notifications", "push_notifications", "sms_notifications",
            "new_clients", "program_updates", "system_maintenance",
            "emergency_requests", "weekly_reports", "monthly_reports",
        ]
        for f in notif_fields:
            if f in request.data:
                setattr(obj, f, request.data[f])
        obj.save()
        return Response(UserSettingsSerializer(obj).data)

    # Preferences update
    @action(detail=False, methods=["put"], url_path="me/preferences")
    def update_preferences(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        obj = self._get_or_create_settings(request.user)
        pref_fields = [
            "theme", "language", "timezone", "date_format",
            "items_per_page", "default_dashboard",
        ]
        for f in pref_fields:
            if f in request.data:
                setattr(obj, f, request.data[f])
        obj.save()
        return Response(UserSettingsSerializer(obj).data)

    # Privacy update
    @action(detail=False, methods=["put"], url_path="me/privacy")
    def update_privacy(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        obj = self._get_or_create_settings(request.user)
        privacy_fields = [
            "allow_analytics", "share_for_research", "enable_session_logging",
            "data_retention", "show_activity_status",
        ]
        for f in privacy_fields:
            if f in request.data:
                setattr(obj, f, request.data[f])
        obj.save()
        return Response(UserSettingsSerializer(obj).data)

    # Password history
    @action(detail=False, methods=["get"], url_path="me/password-history")
    def password_history(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        qs = PasswordChangeHistory.objects.filter(user=request.user)[:10]
        ser = PasswordChangeHistorySerializer(qs, many=True)
        return Response(ser.data)