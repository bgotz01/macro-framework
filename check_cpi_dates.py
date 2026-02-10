import sqlite3
from datetime import datetime

conn = sqlite3.connect('data/macro-data.db')
cursor = conn.cursor()

# Get latest CPI data with more detail
cursor.execute("""
    SELECT date, value, column_name 
    FROM time_series 
    WHERE asset_class = 'economic' AND series_name = 'CPI' 
    ORDER BY date DESC 
    LIMIT 10
""")

rows = cursor.fetchall()
print('Latest CPI data in database:')
print('-' * 60)
for row in rows:
    # Convert timestamp to readable date
    date_str = datetime.fromtimestamp(row[0] / 1000).strftime('%Y-%m-%d %H:%M:%S')
    print(f'Timestamp: {row[0]}, Date: {date_str}, Value: {row[1]:.2f}, Column: {row[2]}')

# Check if there's any December 2025 data
cursor.execute("""
    SELECT date, value, column_name 
    FROM time_series 
    WHERE asset_class = 'economic' AND series_name = 'CPI' 
    AND date >= 1733011200000
    ORDER BY date DESC
""")

dec_rows = cursor.fetchall()
print('\n\nDecember 2025 data (timestamp >= 1733011200000):')
print('-' * 60)
if dec_rows:
    for row in dec_rows:
        date_str = datetime.fromtimestamp(row[0] / 1000).strftime('%Y-%m-%d %H:%M:%S')
        print(f'Timestamp: {row[0]}, Date: {date_str}, Value: {row[1]:.2f}, Column: {row[2]}')
else:
    print('No December 2025 data found')

conn.close()
