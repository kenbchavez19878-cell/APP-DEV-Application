import sys
sys.path.append('OFW OWWA Services Module')
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mswd_backend.settings')
import django
django.setup()
from django.db import connection

# Get model fields
from core_profiles.models import OFWRegistration
model_fields = {f.name for f in OFWRegistration._meta.get_fields()}
print('Model fields count:', len(model_fields))

# Get database columns
with connection.cursor() as cursor:
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'core_profiles_ofwregistration'")
    db_columns = {row[0] for row in cursor.fetchall()}
    print('Database columns count:', len(db_columns))

# Find missing columns
missing_in_db = model_fields - db_columns
extra_in_db = db_columns - model_fields

print('\nMissing in DB:', sorted(missing_in_db))
print('Extra in DB:', sorted(extra_in_db))