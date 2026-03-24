#!/usr/bin/env python3
"""
Extract month-end P/E values from Nikkei daily CSV files.
Fixes date format (Mon/DD/YYYY -> YYYY-MM-DD) and keeps only the last trading day per month.
"""

import csv
import os
import glob
from datetime import datetime

INPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'nikkei')
OUTPUT_FILE = os.path.join(INPUT_DIR, 'nikkei_pe_month_end.csv')

rows = []

for filepath in sorted(glob.glob(os.path.join(INPUT_DIR, 'nikkei_*.csv'))):
    # Skip our output file if it already exists
    if 'month_end' in os.path.basename(filepath):
        continue
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row['date'].strip()
            dt = datetime.strptime(date_str, '%b/%d/%Y')
            rows.append({
                'date': dt,
                'pe_market': row['pe_market'].strip(),
                'pe_weighted': row['pe_weighted'].strip(),
            })

# Sort by date
rows.sort(key=lambda r: r['date'])

# Group by (year, month) and keep the last entry per group
month_end = {}
for r in rows:
    key = (r['date'].year, r['date'].month)
    month_end[key] = r  # last one wins since sorted

# Write output
with open(OUTPUT_FILE, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['date', 'pe_market', 'pe_weighted'])
    for key in sorted(month_end.keys()):
        r = month_end[key]
        writer.writerow([
            r['date'].strftime('%Y-%m-%d'),
            r['pe_market'],
            r['pe_weighted'],
        ])

print(f"Wrote {len(month_end)} month-end rows to {OUTPUT_FILE}")
