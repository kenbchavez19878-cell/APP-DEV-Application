import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mswd_backend.settings')
from django.db import connection
with connection.cursor() as cursor:
    # Use raw SQL to get column names (PostgreSQL syntax)
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'core_profiles_ofwregistration'")
    columns = [row[0] for row in cursor.fetchall()]
    print('Current columns:', sorted(columns))