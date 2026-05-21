from django.contrib import admin
from .models import OFWRegistration, OWWAOfficerProfile, UserSettings, PasswordChangeHistory

@admin.register(OFWRegistration)
class OFWRegistrationAdmin(admin.ModelAdmin):
    list_display = ('client_id', 'worker_type', 'country_of_deployment', 'owwa_membership_status', 'emergency_contact_name')
    search_fields = ('client_id', 'emergency_contact_name', 'occupation_position', 'first_name', 'last_name')
    list_filter = ('worker_type', 'country_of_deployment', 'owwa_membership_status')

@admin.register(OWWAOfficerProfile)
class OWWAOfficerProfileAdmin(admin.ModelAdmin):
    list_display = ('client_id', 'role_position', 'specialty_focus_area', 'assigned_region', 'assigned_province', 'assigned_city', 'employment_status', 'start_date')
    search_fields = ('client_id', 'assigned_city', 'assigned_province', 'assigned_region')
    list_filter = ('role_position', 'specialty_focus_area', 'employment_status', 'assigned_region')

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display  = ('user', 'full_name', 'position', 'theme', 'language', 'two_factor_enabled', 'updated_at')
    search_fields = ('user__username', 'full_name', 'email', 'position')
    list_filter   = ('theme', 'language', 'two_factor_enabled', 'data_retention')
    readonly_fields = ('updated_at',)

@admin.register(PasswordChangeHistory)
class PasswordChangeHistoryAdmin(admin.ModelAdmin):
    list_display  = ('user', 'changed_at', 'ip_address')
    search_fields = ('user__username',)
    list_filter   = ('changed_at',)
    readonly_fields = ('user', 'changed_at', 'ip_address', 'user_agent')