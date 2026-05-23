import sys
sys.path.append('OFW OWWA Services Module')
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mswd_backend.settings')
import django
django.setup()
from django.db import connection

with connection.cursor() as cursor:
    # Check all tables in the database
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    tables = cursor.fetchall()
    print('All tables in database:')
    ofw_tables = []
    for table in tables:
        table_name = table[0]
        if 'ofw' in table_name.lower() or 'profile' in table_name.lower():
            ofw_tables.append(table_name)
            print(f'  * {table_name}')
            # Get row count
            cursor.execute('SELECT COUNT(*) FROM ' + table_name)
            count = cursor.fetchone()[0]
            print(f'    Rows: {count}')
    print(f'\nFound {len(ofw_tables)} OFW/profile related tables')