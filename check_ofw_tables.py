import sys
sys.path.append('OFW OWWA Services Module')
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mswd_backend.settings')
import django
django.setup()
from django.db import connection

with connection.cursor() as cursor:
    # Check what tables exist
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name LIKE '%ofw%' OR table_name LIKE '%profile%'
        ORDER BY table_name
    """)
    tables = cursor.fetchall()
    print('OFW/Profile related tables:')
    for table in tables:
        print(f'  - {table[0]}')
        
    # Check row counts for OFW registration table
    cursor.execute('SELECT COUNT(*) FROM core_profiles_ofwregistration')
    count = cursor.fetchone()[0]
    print(f'\nRow count in core_profiles_ofwregistration: {count}')
    
    # If there are discrepancies, check the actual table structure
    if count == 0:
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'core_profiles_ofwregistration'
            ORDER BY ordinal_position
        """)
        columns = cursor.fetchall()
        print('\nTable structure:')
        for col in columns:
            print(f'  - {col[0]}: {col[1]}')
    else:
        cursor.execute('SELECT * FROM core_profiles_ofwregistration LIMIT 5')
        rows = cursor.fetchall()
        print(f'\nFirst 5 rows:')
        for row in rows:
            print(f'  - {row}')