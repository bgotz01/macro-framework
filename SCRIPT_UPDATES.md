# Script Updates - Multi-Database Import References

## Summary

Updated all Python and shell scripts to reference the new multi-database import command instead of the legacy single-database import.

## Changes Made

### Python Scripts Updated (8 files)

All Python data fetching scripts now recommend the new multi-database import:

1. **`scripts/batch_update_all.py`**
   - Shows multiple import options with examples
   - Recommends `--all` flag for importing to all databases

2. **`scripts/update_equities.py`**
3. **`scripts/update_bonds.py`**
4. **`scripts/update_commodities.py`**
5. **`scripts/update_crypto.py`**
6. **`scripts/update_fx.py`**
7. **`scripts/update_stocks.py`**
8. **`scripts/update_volatility.py`**
   - All now show: `npx tsx scripts/import-data-multi-db.ts --all`

### Shell Scripts Updated (3 files)

1. **`scripts/update-all.sh`**
   - Main update pipeline
   - Changed: `import-data-incremental.ts` → `import-data-multi-db.ts --all`

2. **`scripts/update_db.sh`**
   - Database update pipeline
   - Changed: `import-data-incremental.ts` → `import-data-multi-db.ts --all`

3. **`scripts/update-economic-data.sh`**
   - Economic data pipeline
   - Changed: `import-data-incremental.ts` → `import-data-multi-db.ts --all`

## Before vs After

### Before (Old Command)
```bash
✅ Updated 50 series. Run 'tsx scripts/import-data-incremental.ts' to import new data into database.
```

### After (New Command)

**For batch_update_all.py:**
```bash
✅ Updated 50 series.

📥 Next steps - Import data to databases:
   • All databases:        npx tsx scripts/import-data-multi-db.ts --all
   • Macro-framework only: npx tsx scripts/import-data-multi-db.ts --macro-framework
   • Macro + StockData:    npx tsx scripts/import-data-multi-db.ts --macro-framework --stockdata
   • Legacy (SQLite):      npx tsx scripts/import-data-incremental.ts
```

**For other update scripts:**
```bash
✅ Updated 10 equity series.

📥 Import to databases: npx tsx scripts/import-data-multi-db.ts --all
```

## Impact

### User Experience
- ✅ Clear guidance on which command to run next
- ✅ Shows multiple database options
- ✅ Consistent messaging across all scripts
- ✅ Backwards compatibility noted (legacy command still shown)

### Workflows
All automated workflows now use the multi-database import:
- Daily data updates
- Economic data updates
- Full database rebuilds

## Testing

To verify the changes work:

```bash
# 1. Run any Python update script
python scripts/batch_update_all.py

# 2. You should see the new import command recommendation
# 3. Run the recommended command
npx tsx scripts/import-data-multi-db.ts --all

# 4. Or run a shell script
bash scripts/update-all.sh
```

## Backwards Compatibility

The old commands still work:
```bash
# Legacy SQLite import (still functional)
npx tsx scripts/import-data-incremental.ts

# Legacy Postgres import (still functional)
npx tsx scripts/pg/import-data-incremental.ts
```

## Documentation Consistency

All documentation now consistently references the new multi-database import:
- ✅ Python scripts output
- ✅ Shell scripts
- ✅ README files
- ✅ DATA_UPDATE_GUIDE.md
- ✅ QUICK_REFERENCE.md

## Files Modified

```
scripts/
├── batch_update_all.py          ✓ Updated
├── update_equities.py           ✓ Updated
├── update_bonds.py              ✓ Updated
├── update_commodities.py        ✓ Updated
├── update_crypto.py             ✓ Updated
├── update_fx.py                 ✓ Updated
├── update_stocks.py             ✓ Updated
├── update_volatility.py         ✓ Updated
├── update-all.sh                ✓ Updated
├── update_db.sh                 ✓ Updated
└── update-economic-data.sh      ✓ Updated
```

## Next Steps

1. **Test the updated scripts**
   ```bash
   python scripts/batch_update_all.py
   # Follow the new import command shown
   ```

2. **Update any custom scripts** you may have that reference the old import command

3. **Share with team** - Let everyone know about the new import command

## Rollback

If needed, you can still use the old commands:
```bash
# SQLite only
npx tsx scripts/import-data-incremental.ts

# Postgres only
npx tsx scripts/pg/import-data-incremental.ts
```

---

**Updated**: 2026-04-22  
**Files Modified**: 11  
**Status**: ✅ Complete
