from rest_framework import serializers
from .models import OFWRegistration, OWWAOfficerProfile, UserSettings, PasswordChangeHistory

class OFWRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OFWRegistration
        fields = '__all__'

class OWWAOfficerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OWWAOfficerProfile
        fields = '__all__'

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model  = UserSettings
        fields = [
            "id", "full_name", "email", "phone", "department", "position",
            "address", "bio", "current_password", "new_password_hash",
            "two_factor_enabled", "session_timeout",
            "email_notifications", "push_notifications", "sms_notifications",
            "new_clients", "program_updates", "system_maintenance",
            "emergency_requests", "weekly_reports", "monthly_reports",
            "theme", "language", "timezone", "date_format",
            "items_per_page", "default_dashboard",
            "allow_analytics", "share_for_research", "enable_session_logging",
            "data_retention", "show_activity_status",
            "updated_at", "created_at",
        ]
        read_only_fields = ("id", "updated_at", "created_at")

class PasswordChangeHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = PasswordChangeHistory
        fields = ["id", "changed_at", "ip_address", "user_agent"]