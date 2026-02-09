import sqlite3
import os

# Connect to the database
db_path = os.path.join(os.getcwd(), 'data', 'macro-data.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Checking for cyclical returns data in the database...\n")

# Check what columns exist with 'Return' in the name
print("1. Columns with 'Return' in the name:")
cursor.execute("""
    SELECT DISTINCT column_name 
    FROM time_series 
    WHERE column_name LIKE '%Return%'
    ORDER BY column_name
""")
return_columns = cursor.fetchall()
if return_columns:
    for col in return_columns:
        print(f"   - {col[0]}")
else:
    print("   ❌ No return columns found!")

print("\n2. Sample data for equities with returns:")
cursor.execute("""
    SELECT asset_class, series_name, COUNT(*) as count
    FROM time_series 
    WHERE asset_class IN ('equities', 'commodities', 'crypto', 'volatility')
      AND column_name LIKE '%Return%'
    GROUP BY asset_class, series_name
    ORDER BY asset_class, series_name
    LIMIT 10
""")
series_with_returns = cursor.fetchall()
if series_with_returns:
    for row in series_with_returns:
        print(f"   {row[0]}/{row[1]}: {row[2]} return data points")
else:
    print("   ❌ No return data found for equities/commodities/crypto/volatility!")

print("\n3. Checking a specific series (equities/SPX):")
cursor.execute("""
    SELECT column_name, COUNT(*) as count
    FROM time_series 
    WHERE asset_class = 'equities' 
      AND series_name = 'SPX'
    GROUP BY column_name
    ORDER BY column_name
""")
spx_columns = cursor.fetchall()
if spx_columns:
    for col in spx_columns:
        print(f"   {col[0]}: {col[1]} data points")
else:
    print("   ❌ SPX not found!")

print("\n4. Sample return values:")
cursor.execute("""
    SELECT date, value
    FROM time_series 
    WHERE asset_class = 'equities' 
      AND series_name = 'SPX'
      AND column_name = 'Value_Return10Y'
    ORDER BY date DESC
    LIMIT 5
""")
sample_returns = cursor.fetchall()
if sample_returns:
    for row in sample_returns:
        date_str = row[0]
        # Convert timestamp to readable date
        from datetime import datetime
        date_obj = datetime.fromtimestamp(date_str / 1000)
        print(f"   {date_obj.strftime('%Y-%m-%d')}: {row[1]:.2f}%")
else:
    print("   ❌ No 10Y return data found for SPX!")

conn.close()
print("\n✓ Done!")
