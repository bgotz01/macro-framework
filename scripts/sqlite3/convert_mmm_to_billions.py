#!/usr/bin/env python3
"""
Convert Money Market Funds Total (MMMFFAQ027S) from millions to billions
"""

import csv

input_file = 'data/economic/MMMFFAQ027S.csv'
output_file = 'data/economic/MMMFFAQ027S.csv'

# Read the data
rows = []
with open(input_file, 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Convert from millions to billions
        value = float(row['MMMFFAQ027S'])
        row['MMMFFAQ027S'] = f"{value / 1000:.3f}"
        rows.append(row)

# Write back to the same file
with open(output_file, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['observation_date', 'MMMFFAQ027S'])
    writer.writeheader()
    writer.writerows(rows)

print(f"Converted {len(rows)} rows from millions to billions")
print(f"First value: {rows[0]['MMMFFAQ027S']} billion")
print(f"Last value: {rows[-1]['MMMFFAQ027S']} billion")
