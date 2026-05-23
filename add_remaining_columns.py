import sys
sys.path.append('OFW OWWA Services Module')
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mswd_backend.settings')
import django
django.setup()
from django.db import connection

# Add remaining missing columns
with connection.cursor() as cursor:
    # Check if issue_date exists
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'core_profiles_ofwregistration' AND column_name = 'issue_date'")
    if not cursor.fetchone():
        cursor.execute('ALTER TABLE core_profiles_ofwregistration ADD COLUMN issue_date DATE')
        print('Added issue_date column')
    else:
        print('issue_date column already exists')
        
    # Check if membership_number exists
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'core_profiles_ofwregistration' AND column_name = 'membership_number'")
    if not cursor.fetchone():
        cursor.execute('ALTER TABLE core_profiles_ofwregistration ADD COLUMN membership_number VARCHAR(50)')
        print('Added membership_number column')
    else:
        print('membership_number column already exists')
        
    # Check if validity_date exists
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'core_profiles_ofwregistration' AND column_name = 'validity_date'")
    if not cursor.fetchone():
        cursor.execute('ALTER TABLE core_profiles_ofwregistration ADD COLUMN validity_date DATE')
        print('Added validity_date column')
    else:
        print('validity_date column already exists')