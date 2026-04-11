#!/usr/bin/env tsx
/**
 * Incremental import of CSV data files into Postgres macro_time_series + macro_series_metadata.
 * Skips dates already present. SQLite is not touched.
 */
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { prisma } from '../../lib/prisma';

const DATA_DIR = path.join(process.cwd(), 'data');
const METADATA_PATH = path.join(process.cwd(), 'data', 'series-metadata.json');

const EXCLUDED_DIRS = new Set(['eps', 'economic', '.git', 'node_modules']);

interface CSVRow { Date?: string; date?: string; Value?: number; value?: number;[key: string]: any; }
interface MetadataFile { [assetClass: string]: { [seriesName: string]: { displayName?: string; description?: string; geography?: string; units?: string } } }

function parseDate(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) throw new Error(`Invalid date: ${dateStr}`);
    return d.toISOString().split('T')[0];
}

function getAssetClasses(): string[] {
    return fs.readdirSync(DATA_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory() && !EXCLUDED_DIRS.has(d.name))
        .map(d => d.name);
}

function getCSVFiles(assetClass: string): Array<{ path: string; relativePath: string }> {
    const assetDir = path.join(DATA_DIR, assetClass);
    if (!fs.existsSync(assetDir)) return [];
    const files: Array<{ path: string; relativePath: string }> = [];
    function scan(dir: string, rel = '') {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
            const full = path.join(dir, entry.name);
            const relPath = rel ? path.join(rel, entry.name) : entry.name;
            if (entry.isDirectory()) scan(full, relPath);
            else if (entry.name.endsWith('.csv')) files.push({ path: full, relativePath: relPath });
        }
    }
    scan(assetDir);
    return files;
}

async function main() {
    console.log('🔄 Starting incremental data import to Postgres...\n');

    let metadata: MetadataFile = {};
    if (fs.existsSync(METADATA_PATH)) {
        try { metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8')); } catch { }
    }

    // Cache max dates per series to avoid repeated queries
    const maxDateCache = new Map<string, string>();
    const existingMaxDates = await prisma.macro_time_series.groupBy({
        by: ['asset_class', 'series_name'],
        _max: { date: true },
    });
    for (const r of existingMaxDates) {
        maxDateCache.set(`${r.asset_class}::${r.series_name}`, r._max.date ?? '1900-01-01');
    }

    let totalRows = 0, totalFiles = 0, skippedFiles = 0, errorFiles = 0;

    for (const assetClass of getAssetClasses()) {
        const csvFiles = getCSVFiles(assetClass);
        if (!csvFiles.length) continue;
        console.log(`📁 ${assetClass.toUpperCase()}`);

        for (const { path: filePath, relativePath } of csvFiles) {
            const seriesName = relativePath.replace('.csv', '').replace(/\\/g, '/');
            const cacheKey = `${assetClass}::${seriesName}`;
            const maxExisting = maxDateCache.get(cacheKey) ?? '1900-01-01';

            try {
                const result = Papa.parse<CSVRow>(fs.readFileSync(filePath, 'utf-8'), { header: true, skipEmptyLines: true, dynamicTyping: true });
                const fields = result.meta.fields ?? [];
                if (!fields.some(f => f.toLowerCase() === 'date') || !fields.some(f => f.toLowerCase() === 'value')) {
                    console.log(`  ❌ ${seriesName}: missing Date or Value column`);
                    errorFiles++; continue;
                }

                const rows: Array<{ date: string; asset_class: string; series_name: string; column_name: string; value: number }> = [];
                for (const row of result.data) {
                    const dateStr = row.Date ?? row.date;
                    const value = row.Value ?? row.value;
                    if (!dateStr || value === null || value === undefined || value === 0) continue;
                    try {
                        const isoDate = parseDate(String(dateStr));
                        if (isoDate <= maxExisting) continue;
                        rows.push({ date: isoDate, asset_class: assetClass, series_name: seriesName, column_name: 'Value', value: Number(value) });
                    } catch { }
                }

                if (!rows.length) { console.log(`  ⏭️  ${seriesName}: no new data`); skippedFiles++; continue; }

                // Batch upsert in chunks of 1000
                for (let i = 0; i < rows.length; i += 1000) {
                    await prisma.macro_time_series.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
                }

                // Upsert metadata
                const meta = metadata[assetClass]?.[seriesName];
                await prisma.macro_series_metadata.upsert({
                    where: { asset_class_series_name: { asset_class: assetClass, series_name: seriesName } },
                    create: { asset_class: assetClass, series_name: seriesName, display_name: meta?.displayName ?? seriesName.replace(/[-_]/g, ' '), description: meta?.description, geography: meta?.geography, units: meta?.units, last_updated: BigInt(Date.now()) },
                    update: { last_updated: BigInt(Date.now()) },
                });

                console.log(`  ✓ ${seriesName}: ${rows.length} new rows`);
                totalRows += rows.length; totalFiles++;
            } catch (err) {
                console.log(`  ❌ ${seriesName}: ${err instanceof Error ? err.message : err}`);
                errorFiles++;
            }
        }
        console.log('');
    }

    console.log('━'.repeat(50));
    console.log(`✅ Done! Files: ${totalFiles}, New rows: ${totalRows.toLocaleString()}, Skipped: ${skippedFiles}, Errors: ${errorFiles}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
