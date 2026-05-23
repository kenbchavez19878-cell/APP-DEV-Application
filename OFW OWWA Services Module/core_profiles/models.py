from django.db import models
from django.contrib.auth.models import User

class OFWRegistration(models.Model):
    # Core Identification
    client_id = models.CharField(max_length=50, unique=True, primary_key=True)

    # Personal Information
    first_name = models.CharField(max_length=100, default="")
    last_name = models.CharField(max_length=100, default="")
    birth_date = models.DateField(blank=True, null=True)
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    CIVIL_STATUS_CHOICES = [
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Divorced', 'Divorced'),
        ('Widowed', 'Widowed'),
        ('Separated', 'Separated'),
    ]
    civil_status = models.CharField(max_length=20, choices=CIVIL_STATUS_CHOICES, blank=True)
    NATIONALITY_CHOICES = [
        ('Filipino', 'Filipino'),
        ('American', 'American'),
        ('Chinese', 'Chinese'),
        ('Japanese', 'Japanese'),
        ('Korean', 'Korean'),
        ('Indian', 'Indian'),
        ('Other', 'Other'),
    ]
    nationality = models.CharField(max_length=20, choices=NATIONALITY_CHOICES, default="Filipino")

    # Contact Information
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)

    # Employment Details Data
    WORKER_TYPE_CHOICES = [
        ('Land-based', 'Land-based OFW'),
        ('Sea-based', 'Sea-based OFW (Seafarer)'),
        ('Government-OFW', 'Government Employed OFW'),
        ('Business-OFW', 'Business / Entrepreneur OFW'),
        ('Student-OFW', 'Student / Scholar OFW'),
        ('Athlete-OFW', 'Athlete / Coach OFW'),
        ('Artist-OFW', 'Artist / Entertainer OFW'),
        ('Missionary-OFW', 'Missionary / Volunteer OFW'),
        ('Media-OFW', 'Media / Journalist OFW'),
        ('Dependent-OFW', 'Dependent Family Member'),
        ('Retiree-OFW', 'Retired OFW'),
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
    contract_start = models.DateField(blank=True, null=True)
    contract_end = models.DateField(blank=True, null=True)

    # OWWA Membership Status Data
    MEMBERSHIP_STATUS_CHOICES = [
        ('Active', 'Active Member'),
        ('Expired', 'Expired'),
        ('Not a Member', 'Not a Member'),
    ]
    owwa_membership_status = models.CharField(max_length=20, choices=MEMBERSHIP_STATUS_CHOICES)
    membership_number = models.CharField(max_length=50, blank=True)
    issue_date = models.DateField(blank=True, null=True)
    validity_date = models.DateField(blank=True, null=True)

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

    # Personal Information
    full_name      = models.CharField(max_length=200, default="")
    email          = models.EmailField(blank=True, default="")
    office_phone   = models.CharField(max_length=20, blank=True, default="")
    mobile_phone   = models.CharField(max_length=20, blank=True, default="")

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
    
    # Philippine Regions
    PHILIPPINE_REGIONS = [
        ('region-1', 'Region I (Ilocos Region)'),
        ('region-2', 'Region II (Cagayan Valley)'),
        ('region-3', 'Region III (Central Luzon)'),
        ('region-4a', 'Region IV-A (CALABARZON)'),
        ('region-4b', 'Region IV-B (MIMAROPA)'),
        ('region-5', 'Region V (Bicol Region)'),
        ('region-6', 'Region VI (Western Visayas)'),
        ('region-7', 'Region VII (Central Visayas)'),
        ('region-8', 'Region VIII (Eastern Visayas)'),
        ('region-9', 'Region IX (Zamboanga Peninsula)'),
        ('region-10', 'Region X (Northern Mindanao)'),
        ('region-11', 'Region XI (Davao Region)'),
        ('region-12', 'Region XII (SOCCSKSARGEN)'),
        ('region-13', 'Region XIII (Caraga)'),
        ('car', 'Cordillera Administrative Region (CAR)'),
        ('ncr', 'National Capital Region (NCR)'),
        ('barmm', 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)'),
    ]
    
    # Sample Philippine Provinces (for demonstration - in practice, you might want a separate model)
    SAMPLE_PHILIPPINE_PROVINCES = [
        ('ilocos-norte', 'Ilocos Norte'),
        ('ilocos-sur', 'Ilocos Sur'),
        ('la-union', 'La Union'),
        ('pangasinan', 'Pangasinan'),
        ('batanes', 'Batanes'),
        ('cagayan', 'Cagayan'),
        ('isabela', 'Isabela'),
        ('nueva-vizcaya', 'Nueva Vizcaya'),
        ('quirino', 'Quirino'),
        ('bataan', 'Bataan'),
        ('bulacan', 'Bulacan'),
        ('nueva-ecija', 'Nueva Ecija'),
        ('pampanga', 'Pampanga'),
        ('tarlac', 'Tarlac'),
        ('zambales', 'Zambales'),
        ('aurora', 'Aurora'),
        ('batangas', 'Batangas'),
        ('cavite', 'Cavite'),
        ('laguna', 'Laguna'),
        ('rizal', 'Rizal'),
        ('quezon', 'Quezon'),
        ('marinduque', 'Marinduque'),
        ('occidental-mindoro', 'Occidental Mindoro'),
        ('oriental-mindoro', 'Oriental Mindoro'),
        ('palawan', 'Palawan'),
        ('romblon', 'Romblon'),
        ('albay', 'Albay'),
        ('camarines-norte', 'Camarines Norte'),
        ('camarines-sur', 'Camarines Sur'),
        ('catanduanes', 'Catanduanes'),
        ('masbate', 'Masbate'),
        ('sorsogon', 'Sorsogon'),
    ]
    
    # Sample Philippine Cities (for demonstration - in practice, you might want a separate model)
    SAMPLE_PHILIPPINE_CITIES = [
        ('manila', 'Manila'),
        ('quezon-city', 'Quezon City'),
        ('caloocan', 'Caloocan'),
        ('pasay', 'Pasay'),
        ('makati', 'Makati'),
        ('pasig', 'Pasig'),
        ('taguig', 'Taguig'),
        ('paranaque', 'Parañaque'),
        ('las-piñas', 'Las Piñas'),
        ('muntilupa', 'Muntinlupa'),
        ('marikina', 'Marikina'),
        ('san-juan', 'San Juan'),
        ('mandaluyong', 'Mandaluyong'),
        ('valenzuela', 'Valenzuela'),
        ('navotas', 'Navotas'),
        ('malabon', 'Malabon'),
        ('cebu-city', 'Cebu City'),
        ('lapu-lapu-city', 'Lapu-Lapu City'),
        ('mandaue', 'Mandaue'),
        ('davao-city', 'Davao City'),
        ('zamboanga-city', 'Zamboanga City'),
        ('cagayan-de-oro', 'Cagayan de Oro'),
        ('bacolod', 'Bacolod'),
        ('iloilo-city', 'Iloilo City'),
    ]
    
    role_position = models.CharField(max_length=35, choices=ROLE_CHOICES)
    specialty_focus_area = models.CharField(max_length=35, choices=SPECIALTY_CHOICES)
    assigned_region = models.CharField(max_length=20, choices=PHILIPPINE_REGIONS, default="region-5")
    assigned_province = models.CharField(max_length=50, choices=SAMPLE_PHILIPPINE_PROVINCES, blank=True, null=True)
    assigned_city = models.CharField(max_length=50, choices=SAMPLE_PHILIPPINE_CITIES, blank=True, null=True)
    start_date = models.DateField()
    employment_status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Office Address and Additional Information
    office_address = models.TextField()
    additional_information = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Officer Profile - {self.role_position} ({self.client_id})"


class UserSettings(models.Model):
    """Stores per-user application settings persisted to the backend."""
    THEME_CHOICES = [("light", "Light"), ("dark", "Dark"), ("system", "System")]
    LANGUAGE_CHOICES = [
        ("en", "English"), ("fil", "Filipino"), ("ceb", "Cebuano"), ("ilo", "Ilocano"),
    ]
    TIMEZONE_CHOICES = [
        ("Asia/Manila", "Asia/Manila (GMT+8)"), ("Asia/Tokyo", "Asia/Tokyo (GMT+9)"),
        ("Asia/Singapore", "Asia/Singapore (GMT+8)"),
    ]
    DATE_FORMAT_CHOICES = [("MM/DD/YYYY", "MM/DD/YYYY"), ("DD/MM/YYYY", "DD/MM/YYYY"), ("YYYY-MM-DD", "YYYY-MM-DD")]
    RETENTION_CHOICES = [("1-year", "1 Year"), ("2-years", "2 Years"), ("5-years", "5 Years"), ("indefinite", "Indefinitely")]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings")

    full_name       = models.CharField(max_length=200, default="")
    email           = models.EmailField(default="")
    phone           = models.CharField(max_length=30, default="")
    department      = models.CharField(max_length=200, default="")
    position        = models.CharField(max_length=200, default="")
    address         = models.TextField(default="")
    bio             = models.TextField(blank=True, default="")

    current_password      = models.CharField(max_length=255, default="")
    new_password_hash     = models.CharField(max_length=255, default="")
    two_factor_enabled    = models.BooleanField(default=False)
    session_timeout       = models.CharField(max_length=20, default="30")

    email_notifications   = models.BooleanField(default=True)
    push_notifications    = models.BooleanField(default=True)
    sms_notifications     = models.BooleanField(default=False)
    new_clients           = models.BooleanField(default=True)
    program_updates       = models.BooleanField(default=True)
    system_maintenance    = models.BooleanField(default=False)
    emergency_requests    = models.BooleanField(default=True)
    weekly_reports        = models.BooleanField(default=True)
    monthly_reports       = models.BooleanField(default=False)

    theme         = models.CharField(max_length=20, choices=THEME_CHOICES, default="light")
    language      = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default="en")
    timezone      = models.CharField(max_length=40, choices=TIMEZONE_CHOICES, default="Asia/Manila")
    date_format   = models.CharField(max_length=20, choices=DATE_FORMAT_CHOICES, default="MM/DD/YYYY")
    items_per_page = models.PositiveIntegerField(default=25)
    default_dashboard = models.CharField(max_length=50, default="overview")

    allow_analytics       = models.BooleanField(default=True)
    share_for_research    = models.BooleanField(default=False)
    enable_session_logging = models.BooleanField(default=True)
    data_retention        = models.CharField(max_length=20, choices=RETENTION_CHOICES, default="2-years")
    show_activity_status  = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "User Settings"
        verbose_name_plural = "User Settings"

    def __str__(self):
        return f"Settings – {self.user.get_username()}"


