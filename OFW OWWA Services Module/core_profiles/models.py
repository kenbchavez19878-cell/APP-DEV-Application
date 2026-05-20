from django.db import models

class OFWRegistration(models.Model):
    # Core Identification
    client_id = models.CharField(max_length=50, unique=True, primary_key=True)

    # Personal Name Data
    first_name = models.CharField(max_length=100, default="")
    last_name = models.CharField(max_length=100, default="")

    # Employment Details Data
    WORKER_TYPE_CHOICES = [
        ('Land-based', 'Land-based OFW'),
        ('Sea-based', 'Sea-based OFW (Seafarer)'),
    ]
    COUNTRY_CHOICES = [
        ('Saudi Arabia', 'Saudi Arabia'),
        ('UAE', 'United Arab Emirates'),
        ('Hong Kong', 'Hong Kong'),
        ('Singapore', 'Singapore'),
        ('Qatar', 'Qatar'),
        ('International Waters', 'International Waters (Sea-based)'),
        ('Others', 'Others'),
    ]
    worker_type = models.CharField(max_length=20, choices=WORKER_TYPE_CHOICES)
    country_of_deployment = models.CharField(max_length=50, choices=COUNTRY_CHOICES)
    occupation_position = models.CharField(max_length=100)
    recruitment_agency = models.CharField(max_length=150)

    # OWWA Membership Status Data
    MEMBERSHIP_STATUS_CHOICES = [
        ('Active', 'Active Member'),
        ('Expired', 'Expired'),
        ('Not a Member', 'Not a Member'),
    ]
    owwa_membership_status = models.CharField(max_length=20, choices=MEMBERSHIP_STATUS_CHOICES)

    # Emergency Contact Details Data
    RELATIONSHIP_CHOICES = [
        ('Spouse', 'Spouse'),
        ('Parent', 'Parent'),
        ('Sibling', 'Sibling'),
        ('Child', 'Child'),
        ('Others', 'Others'),
    ]
    emergency_contact_name = models.CharField(max_length=150)
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES)
    emergency_contact_number = models.CharField(max_length=20)

    def __str__(self):
        return f"OFW Profile - {self.client_id}"


class OWWAOfficerProfile(models.Model):
    # Core Identification
    client_id = models.CharField(max_length=50, unique=True, primary_key=True)
    
    # Position Details Data
    ROLE_CHOICES = [
        ('Regional Director', 'Regional Director'),
        ('Welfare Officer', 'Welfare Officer'),
        ('Case Officer', 'Case Officer'),
        ('Admin Staff', 'Admin Staff'),
        ('Legal Officer', 'Legal Officer'),
    ]
    SPECIALTY_CHOICES = [
        ('Repatriation', 'Repatriation Services'),
        ('Legal Assistance', 'Legal Assistance'),
        ('Crisis Response', 'Crisis Response'),
        ('Medical Assistance', 'Medical Assistance'),
        ('Administration', 'Administration'),
        ('Documentation', 'Documentation'),
    ]
    STATUS_CHOICES = [
        ('Permanent', 'Permanent'),
        ('Contractual', 'Contractual'),
        ('Probationary', 'Probationary'),
    ]
    
    role_position = models.CharField(max_length=35, choices=ROLE_CHOICES)
    specialty_focus_area = models.CharField(max_length=35, choices=SPECIALTY_CHOICES)
    assigned_region = models.CharField(max_length=50, default="Region V (Bicol Region)")
    assigned_province = models.CharField(max_length=100, blank=True, null=True)
    assigned_city = models.CharField(max_length=100, blank=True, null=True)
    start_date = models.DateField()
    employment_status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Office Address and Additional Information
    office_address = models.TextField()
    additional_information = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Officer Profile - {self.role_position} ({self.client_id})"