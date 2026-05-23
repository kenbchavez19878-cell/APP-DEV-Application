import sys
sys.path.append('OFW OWWA Services Module')
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mswd_backend.settings')
import django
django.setup()
from django.db import connection

with connection.cursor() as cursor:
    # List all tables with 'ofw' in the name
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name LIKE '%ofw%'
        ORDER BY table_name
    """)
    tables = cursor.fetchall()
    print('All OFW-related tables:')
    for table in tables:
        print(f'  - {table[0]}')
        # Get row count for each
        cursor.execute('SELECT COUNT(*) FROM ' + table[0])
        count = cursor.fetchone()[0]
        print(f'    Rows: {count}')
        if count > 0 and count <= 10:  # Show sample data for small tables
            cursor.execute('SELECT * FROM ' + table[0] + ' LIMIT 3')
            rows = cursor.fetchall()
            for row in rows:
                print(f'    Sample: {row}')
        print()