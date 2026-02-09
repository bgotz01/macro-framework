import sqlite3
import os

# Connect to the database
db_path = os.path.join(os.getcwd(), 'data', 'macro-data.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Checking data sizes for US/GSPC:\n")

# Check Value column
cursor.execute("""
    SELECT COUNT(*) 
    FROM time_series 
    WHERE asset_class = 'equities' 
      AND series_name = 'US/GSPC'
      AND column_name = 'Value'
""")
value_count = cursor.fetchone()[0]
print(f"Value column: {value_count:,} data points")

# Check Return columns
for period in ['2Y', '5Y', '10Y']:
    cursor.execute(f"""
        SELECT COUNT(*) 
        FROM time_series 
        WHERE asset_class = 'equities' 
          AND series_name = 'US/GSPC'
          AND column_name = 'Value_Return{period}'
    """)
    count = cursor.fetchone()[0]
    print(f"Value_Return{period}: {count:,} data points")

# Check total rows when fetching all return columns
cursor.execute("""
    SELECT COUNT(DISTINCT date)
    FROM time_series 
    WHERE asset_class = 'equities' 
      AND series_name = 'US/GSPC'
      AND column_name IN ('Value_Return2Y', 'Value_Return5Y', 'Value_Return10Y')
""")
distinct_dates = cursor.fetchone()[0]
print(f"\nDistinct dates with return data: {distinct_dates:,}")

conn.close()
