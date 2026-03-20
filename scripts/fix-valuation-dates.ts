import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

function toMonthEnd(dateStr: string): string {
    const [y, m] = dateStr.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

console.log('Converting valuation series from 1st-of-month to month-end dates...\n');

// time_series
const tsRows = db.prepare(`
    SELECT rowid, date, asset_class, series_name, column_name, value
    FROM time_series
    WHERE asset_class = 'valuations' AND substr(date, 9, 2) = '01'
`).all() as { rowid: number; date: string; asset_class: string; series_name: string; column_name: string; value: number }[];

console.log(`Found ${tsRows.length} time_series rows to convert`);

const updateTS = db.prepare(`UPDATE time_series SET date = ? WHERE rowid = ?`);
const deleteTS = db.prepare(`DELETE FROM time_series WHERE rowid = ?`);
const checkTS = db.prepare(`SELECT 1 FROM time_series WHERE date = ? AND asset_class = ? AND series_name = ? AND column_name = ?`);

let tsUpdated = 0, tsDupes = 0;
const convertTS = db.transaction(() => {
    for (const row of tsRows) {
        const newDate = toMonthEnd(row.date);
        const exists = checkTS.get(newDate, row.asset_class, row.series_name, row.column_name);
        if (exists) {
            deleteTS.run(row.rowid);
            tsDupes++;
        } else {
            updateTS.run(newDate, row.rowid);
            tsUpdated++;
        }
    }
});
convertTS();
console.log(`  Updated: ${tsUpdated}, Duplicates removed: ${tsDupes}`);

// percentile_analysis
const paRows = db.prepare(`
    SELECT rowid, date, asset_class, series_name, column_name, value
    FROM percentile_analysis
    WHERE asset_class = 'valuations' AND substr(date, 9, 2) = '01'
`).all() as { rowid: number; date: string; asset_class: string; series_name: string; column_name: string; value: number }[];

console.log(`\nFound ${paRows.length} percentile_analysis rows to convert`);

const updatePA = db.prepare(`UPDATE percentile_analysis SET date = ? WHERE rowid = ?`);
const deletePA = db.prepare(`DELETE FROM percentile_analysis WHERE rowid = ?`);
const checkPA = db.prepare(`SELECT 1 FROM percentile_analysis WHERE date = ? AND asset_class = ? AND series_name = ? AND column_name = ?`);

let paUpdated = 0, paDupes = 0;
const convertPA = db.transaction(() => {
    for (const row of paRows) {
        const newDate = toMonthEnd(row.date);
        const exists = checkPA.get(newDate, row.asset_class, row.series_name, row.column_name);
        if (exists) {
            deletePA.run(row.rowid);
            paDupes++;
        } else {
            updatePA.run(newDate, row.rowid);
            paUpdated++;
        }
    }
});
convertPA();
console.log(`  Updated: ${paUpdated}, Duplicates removed: ${paDupes}`);

// Verify
const remaining = db.prepare(`SELECT COUNT(*) as cnt FROM time_series WHERE asset_class = 'valuations' AND substr(date, 9, 2) = '01'`).get() as { cnt: number };
console.log(`\nRemaining 1st-of-month rows in time_series: ${remaining.cnt}`);

const sample = db.prepare(`SELECT date, value FROM time_series WHERE series_name = 'SP500-Price' AND column_name = 'Value' ORDER BY date DESC LIMIT 5`).all() as { date: string; value: number }[];
console.log('\nSP500-Price recent dates:');
sample.forEach(r => console.log(`  ${r.date}: ${r.value.toFixed(2)}`));

db.close();
console.log('\n✓ Done!');
