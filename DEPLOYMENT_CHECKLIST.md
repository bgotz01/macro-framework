# Multi-Database Import - Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] `.env` file has all database URLs configured
  ```bash
  grep DATABASE .env
  ```
- [ ] SQLite database file exists (if using SQLite)
  ```bash
  ls -lh data/macro-data.db
  ```
- [ ] Postgres databases are accessible
  ```bash
  psql -d macro-framework -c "SELECT 1;"
  psql -d stockdata -c "SELECT 1;"
  ```

### 2. Database Schema Verification
- [ ] SQLite has required tables
  ```bash
  sqlite3 data/macro-data.db ".tables"
  # Should show: time_series, series_metadata
  ```
- [ ] Postgres (macro-framework) has required tables
  ```bash
  psql -d macro-framework -c "\dt macro_*"
  # Should show: macro_time_series, macro_series_metadata
  ```
- [ ] Postgres (stockdata) has required tables
  ```bash
  psql -d stockdata -c "\dt macro_*"
  # Should show: macro_time_series, macro_series_metadata
  ```

### 3. Dependencies Check
- [ ] Node.js dependencies installed
  ```bash
  npm list better-sqlite3 @prisma/client papaparse
  ```
- [ ] Python dependencies installed
  ```bash
  pip list | grep -E "yfinance|pandas"
  ```
- [ ] Prisma client generated
  ```bash
  npx prisma generate
  ```

### 4. File Permissions
- [ ] Import scripts are executable
  ```bash
  chmod +x scripts/import-all-dbs.sh
  ```
- [ ] CSV directory is readable
  ```bash
  ls -la data/
  ```

## Testing Checklist

### 1. Dry Run Test
- [ ] Test with a single database first
  ```bash
  npx tsx scripts/import-data-multi-db.ts --macro-framework
  ```
- [ ] Verify no errors in output
- [ ] Check row counts match expectations

### 2. Multi-Database Test
- [ ] Test with all databases
  ```bash
  npx tsx scripts/import-data-multi-db.ts --all
  ```
- [ ] Verify all databases connected successfully
- [ ] Check statistics for each database

### 3. Data Verification
- [ ] Verify data in SQLite
  ```bash
  sqlite3 data/macro-data.db "SELECT COUNT(*) FROM time_series;"
  sqlite3 data/macro-data.db "SELECT MAX(date) FROM time_series WHERE series_name='US/GSPC';"
  ```
- [ ] Verify data in macro-framework
  ```bash
  psql -d macro-framework -c "SELECT COUNT(*) FROM macro_time_series;"
  psql -d macro-framework -c "SELECT MAX(date) FROM macro_time_series WHERE series_name='US/GSPC';"
  ```
- [ ] Verify data in stockdata
  ```bash
  psql -d stockdata -c "SELECT COUNT(*) FROM macro_time_series;"
  psql -d stockdata -c "SELECT MAX(date) FROM macro_time_series WHERE series_name='US/GSPC';"
  ```

### 4. Metadata Verification
- [ ] Check metadata in SQLite
  ```bash
  sqlite3 data/macro-data.db "SELECT * FROM series_metadata LIMIT 5;"
  ```
- [ ] Check metadata in Postgres
  ```bash
  psql -d macro-framework -c "SELECT * FROM macro_series_metadata LIMIT 5;"
  ```

### 5. Incremental Import Test
- [ ] Run import twice, verify no duplicates
  ```bash
  npx tsx scripts/import-data-multi-db.ts --all
  npx tsx scripts/import-data-multi-db.ts --all
  # Second run should show "no new data"
  ```

### 6. Error Handling Test
- [ ] Test with invalid CSV file
- [ ] Test with missing database
- [ ] Verify script continues on errors

## Performance Testing

### 1. Baseline Metrics
- [ ] Record import time for each database
  ```bash
  time npx tsx scripts/import-data-multi-db.ts --sqlite
  time npx tsx scripts/import-data-multi-db.ts --macro-framework
  time npx tsx scripts/import-data-multi-db.ts --stockdata
  time npx tsx scripts/import-data-multi-db.ts --all
  ```

### 2. Large Dataset Test
- [ ] Test with full historical data
- [ ] Monitor memory usage
  ```bash
  /usr/bin/time -l npx tsx scripts/import-data-multi-db.ts --all
  ```

### 3. Concurrent Access Test
- [ ] Run import while application is running
- [ ] Verify no lock conflicts

## Integration Testing

### 1. Complete Workflow Test
- [ ] Fetch new data
  ```bash
  python scripts/batch_update_all.py
  ```
- [ ] Import to all databases
  ```bash
  npx tsx scripts/import-data-multi-db.ts --all
  ```
- [ ] Calculate derived metrics
  ```bash
  npx tsx scripts/add-cyclical-returns.ts
  npx tsx scripts/add-volatility-metrics.ts
  ```
- [ ] Verify application can read data

### 2. API Endpoint Test
- [ ] Test data endpoints return correct data
- [ ] Verify dates match across databases
- [ ] Check percentile calculations

## Production Deployment

### 1. Backup
- [ ] Backup SQLite database
  ```bash
  cp data/macro-data.db data/macro-data.db.backup
  ```
- [ ] Backup Postgres databases
  ```bash
  pg_dump macro-framework > macro-framework-backup.sql
  pg_dump stockdata > stockdata-backup.sql
  ```

### 2. Deploy Files
- [ ] Copy new files to production
  - `lib/multi-db-client.ts`
  - `scripts/import-data-multi-db.ts`
  - `scripts/import-all-dbs.sh`
- [ ] Update `.env` with production database URLs
- [ ] Update documentation files

### 3. Production Test
- [ ] Run import in production environment
  ```bash
  npx tsx scripts/import-data-multi-db.ts --all
  ```
- [ ] Verify no errors
- [ ] Check data integrity

### 4. Monitoring Setup
- [ ] Set up logging for import script
- [ ] Configure alerts for import failures
- [ ] Monitor database sizes
  ```bash
  # SQLite
  ls -lh data/macro-data.db
  
  # Postgres
  psql -d macro-framework -c "SELECT pg_size_pretty(pg_database_size('macro-framework'));"
  psql -d stockdata -c "SELECT pg_size_pretty(pg_database_size('stockdata'));"
  ```

### 5. Automation
- [ ] Add to cron job or scheduler
  ```bash
  # Example crontab entry (daily at 6 AM)
  0 6 * * * cd /path/to/project && python scripts/batch_update_all.py && npx tsx scripts/import-data-multi-db.ts --all
  ```
- [ ] Test automated execution
- [ ] Verify email notifications work

## Post-Deployment Verification

### 1. Data Consistency Check
- [ ] Compare row counts across databases
  ```bash
  # Should be identical
  sqlite3 data/macro-data.db "SELECT COUNT(*) FROM time_series WHERE series_name='US/GSPC';"
  psql -d macro-framework -c "SELECT COUNT(*) FROM macro_time_series WHERE series_name='US/GSPC';"
  psql -d stockdata -c "SELECT COUNT(*) FROM macro_time_series WHERE series_name='US/GSPC';"
  ```

### 2. Application Health Check
- [ ] Verify application starts successfully
- [ ] Test all data-dependent features
- [ ] Check for any errors in logs

### 3. Performance Monitoring
- [ ] Monitor import execution time
- [ ] Check database query performance
- [ ] Verify no degradation in application response time

## Rollback Plan

### If Issues Occur:

1. **Stop automated imports**
   ```bash
   # Disable cron job
   crontab -e
   # Comment out the import line
   ```

2. **Restore from backup**
   ```bash
   # SQLite
   cp data/macro-data.db.backup data/macro-data.db
   
   # Postgres
   psql -d macro-framework < macro-framework-backup.sql
   psql -d stockdata < stockdata-backup.sql
   ```

3. **Revert to old import scripts**
   ```bash
   # Use legacy scripts
   npx tsx scripts/import-data-incremental.ts  # SQLite
   npx tsx scripts/pg/import-data-incremental.ts  # Postgres
   ```

4. **Investigate and fix issues**
   - Check error logs
   - Verify environment configuration
   - Test with small dataset

## Success Criteria

- [ ] All databases import successfully
- [ ] No data loss or corruption
- [ ] Import completes in reasonable time (<5 minutes)
- [ ] Application functions normally
- [ ] No increase in error rates
- [ ] Automated imports run successfully

## Documentation Updates

- [ ] Update team wiki with new import process
- [ ] Update runbooks with troubleshooting steps
- [ ] Document any environment-specific configurations
- [ ] Share QUICK_REFERENCE.md with team

## Training

- [ ] Train team on new import commands
- [ ] Demonstrate multi-database import
- [ ] Review troubleshooting procedures
- [ ] Share documentation links

## Sign-off

- [ ] Development testing complete
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Team trained on new process
- [ ] Documentation updated
- [ ] Monitoring in place

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Verified By**: _______________

**Notes**: _______________________________________________
