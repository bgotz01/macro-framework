import { PrismaClient } from '@prisma/client';

const globalForStockdata = globalThis as unknown as {
    stockdataPrisma: PrismaClient | undefined;
};

function createStockdataClient(): PrismaClient {
    const url = process.env.STOCKDATA_DATABASE_URL;
    if (!url) {
        throw new Error('STOCKDATA_DATABASE_URL is not configured');
    }
    return new PrismaClient({
        datasources: { db: { url } },
    });
}

export const stockdata =
    globalForStockdata.stockdataPrisma ?? createStockdataClient();

if (process.env.NODE_ENV !== 'production') {
    globalForStockdata.stockdataPrisma = stockdata;
}
