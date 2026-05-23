import sys
sys.path.append('OFW OWWA Services Module')
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mswd_backend.settings')
import django
django.setup()
from django.db import connection

# Add missing columns that model expects but DB doesn't have
with connection.cursor() as cursor:
    # Check if contract_start exists
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'core_profiles_ofwregistration' AND column_name = 'contract_start'")
    if not cursor.fetchone():
        cursor.execute('ALTER TABLE core_profiles_ofwregistration ADD COLUMN contract_start DATE')
        print('Added contract_start column')
    else:
        print('contract_start column already exists')
        
    # Check if contract_end exists
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'core_profiles_ofwregistration' AND column_name = 'contract_end'")
    if not cursor.fetchone():
        cursor.execute('ALTER TABLE core_profiles_ofwregistration ADD COLUMN contract_end DATE')
        print('Added contract_end column')
    else:
        print('contract_end column already exists')