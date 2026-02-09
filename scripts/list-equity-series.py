import sqlite3
import os

# Connect to the database
db_path = os.path.join(os.getcwd(), 'data', 'macro-data.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Available equity series:\n")

cursor.execute("""
    SELECT DISTINCT series_name
    FROM time_series 
    WHERE asset_class = 'equities'
    ORDER BY series_name
""")
series = cursor.fetchall()
for s in series:
    print(f"   - {s[0]}")

conn.close()
