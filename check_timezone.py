from datetime import datetime
import time

# Check current timezone
print(f"Current timezone offset: {time.timezone / 3600} hours")
print(f"Timezone name: {time.tzname}")

# Test date parsing
test_date = "2025-12-01"
parsed = datetime.fromisoformat(test_date)
print(f"\nParsing '{test_date}':")
print(f"Datetime: {parsed}")
print(f"Timestamp (ms): {int(parsed.timestamp() * 1000)}")
print(f"UTC: {datetime.utcfromtimestamp(parsed.timestamp())}")
