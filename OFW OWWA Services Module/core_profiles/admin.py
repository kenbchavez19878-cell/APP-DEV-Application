from django.contrib import admin
from .models import OFWRegistration, OWWAOfficerProfile

@admin.register(OFWRegistration)
class OFWRegistrationAdmin(admin.ModelAdmin):
    list_display = ('client_id', 'worker_type', 'country_of_deployment', 'owwa_membership_status', 'emergency_contact_name')
    search_fields = ('client_id', 'emergency_contact_name', 'occupation_position')
    list_filter = ('worker_type', 'country_of_deployment', 'owwa_membership_status')

@admin.register(OWWAOfficerProfile)
class OWWAOfficerProfileAdmin(admin.ModelAdmin):
    list_display = ('client_id', 'role_position', 'specialty_focus_area', 'employment_status', 'start_date')
    search_fields = ('client_id', 'assigned_city', 'assigned_province')
    list_filter = ('role_position', 'specialty_focus_area', 'employment_status')