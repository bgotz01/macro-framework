'use client';

import { useEffect, useState } from 'react';

export interface MatrixValues {
    inflation: number | null;
    bondYieldNominal: number | null;
    bondYieldReal: number | null;
    yieldCurve: number | null;
    equityPE: number | null;
    vix: number | null;
}

interface MatrixDataFetcherProps {
    children: (values: MatrixValues, loading: boolean) => React.ReactNode;
}

export default function MatrixDataFetcher({ children }: MatrixDataFetcherProps) {
    const [values, setValues] = useState<MatrixValues>({
        inflation: null,
        bondYieldNominal: null,
        bondYieldReal: null,
        yieldCurve: null,
        equityPE: null,
        vix: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch all required data in parallel
                const [cpi, tenYear, twoYear, shillerPE, vix] = await Promise.all([
                    fetchLatestValue('economic', 'CPI'),
                    fetchLatestValue('bonds', 'US/TNX'),
                    fetchLatestValue('bonds', 'US/US-2yr'),
                    fetchLatestValue('valuations', 'Shiller-PE'),
                    fetchLatestValue('volatility', 'VIX'),
                ]);

                const inflation = cpi;
                const bondYieldNominal = tenYear;
                const bondYieldReal = tenYear !== null && inflation !== null
                    ? tenYear - inflation
                    : null;
                const yieldCurve = tenYear !== null && twoYear !== null
                    ? tenYear - twoYear
                    : null;

                setValues({
                    inflation,
                    bondYieldNominal,
                    bondYieldReal,
                    yieldCurve,
                    equityPE: shillerPE,
                    vix,
                });
            } catch (error) {
                console.error('Error fetching matrix data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    async function fetchLatestValue(assetClass: string, seriesName: string): Promise<number | null> {
        try {
            const response = await fetch(`/api/data/${assetClass}?series=${seriesName}`);
            if (!response.ok) return null;

            const result = await response.json();
            if (result.data && result.data.length > 0) {
                const latest = result.data[result.data.length - 1];
                const columns = Object.keys(latest).filter(k => k !== 'date');
                return columns.length > 0 ? latest[columns[0]] : null;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching ${assetClass}/${seriesName}:`, error);
            return null;
        }
    }

    return <>{children(values, loading)}</>;
}
