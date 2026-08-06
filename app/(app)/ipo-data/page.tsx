// IPO data inlined to avoid filesystem access at build time
import IPOChart from '@/components/charts/ipo-chart';

export interface IPORow {
    year: number;
    ipos: number;
    firstDayEW: number;
    firstDayPW: number;
    firstDayMedian: number;
    leftOnTable: number;
    proceeds: number;
}

const IPO_DATA: IPORow[] = [
    { year: 1980, ipos: 71, firstDayEW: 14.30, firstDayPW: 20.00, firstDayMedian: 6.90, leftOnTable: 0.18, proceeds: 0.91 },
    { year: 1981, ipos: 192, firstDayEW: 5.90, firstDayPW: 5.70, firstDayMedian: 0.30, leftOnTable: 0.13, proceeds: 2.31 },
    { year: 1982, ipos: 77, firstDayEW: 11.00, firstDayPW: 13.30, firstDayMedian: 3.70, leftOnTable: 0.13, proceeds: 1.00 },
    { year: 1983, ipos: 451, firstDayEW: 9.90, firstDayPW: 9.40, firstDayMedian: 2.50, leftOnTable: 0.84, proceeds: 8.89 },
    { year: 1984, ipos: 171, firstDayEW: 3.70, firstDayPW: 2.50, firstDayMedian: 0.00, leftOnTable: 0.05, proceeds: 2.02 },
    { year: 1985, ipos: 186, firstDayEW: 6.40, firstDayPW: 5.60, firstDayMedian: 2.80, leftOnTable: 0.23, proceeds: 4.09 },
    { year: 1986, ipos: 393, firstDayEW: 6.10, firstDayPW: 5.10, firstDayMedian: 1.10, leftOnTable: 0.68, proceeds: 13.40 },
    { year: 1987, ipos: 285, firstDayEW: 5.60, firstDayPW: 5.70, firstDayMedian: 1.30, leftOnTable: 0.66, proceeds: 11.68 },
    { year: 1988, ipos: 105, firstDayEW: 5.50, firstDayPW: 3.40, firstDayMedian: 2.30, leftOnTable: 0.13, proceeds: 3.88 },
    { year: 1989, ipos: 116, firstDayEW: 8.00, firstDayPW: 4.70, firstDayMedian: 4.00, leftOnTable: 0.27, proceeds: 5.81 },
    { year: 1990, ipos: 110, firstDayEW: 10.80, firstDayPW: 8.10, firstDayMedian: 5.60, leftOnTable: 0.34, proceeds: 4.24 },
    { year: 1991, ipos: 286, firstDayEW: 11.90, firstDayPW: 9.70, firstDayMedian: 7.50, leftOnTable: 1.50, proceeds: 15.39 },
    { year: 1992, ipos: 412, firstDayEW: 10.30, firstDayPW: 8.00, firstDayMedian: 4.40, leftOnTable: 1.82, proceeds: 22.69 },
    { year: 1993, ipos: 510, firstDayEW: 12.70, firstDayPW: 11.20, firstDayMedian: 6.30, leftOnTable: 3.52, proceeds: 31.44 },
    { year: 1994, ipos: 402, firstDayEW: 9.60, firstDayPW: 8.30, firstDayMedian: 4.20, leftOnTable: 1.43, proceeds: 17.18 },
    { year: 1995, ipos: 462, firstDayEW: 21.40, firstDayPW: 17.50, firstDayMedian: 13.20, leftOnTable: 4.90, proceeds: 27.93 },
    { year: 1996, ipos: 677, firstDayEW: 17.20, firstDayPW: 16.10, firstDayMedian: 10.00, leftOnTable: 6.76, proceeds: 42.05 },
    { year: 1997, ipos: 474, firstDayEW: 14.00, firstDayPW: 14.40, firstDayMedian: 9.40, leftOnTable: 4.56, proceeds: 31.76 },
    { year: 1998, ipos: 283, firstDayEW: 21.90, firstDayPW: 15.60, firstDayMedian: 8.90, leftOnTable: 5.25, proceeds: 33.66 },
    { year: 1999, ipos: 476, firstDayEW: 71.20, firstDayPW: 57.40, firstDayMedian: 37.50, leftOnTable: 37.11, proceeds: 64.67 },
    { year: 2000, ipos: 380, firstDayEW: 56.30, firstDayPW: 45.80, firstDayMedian: 27.90, leftOnTable: 29.68, proceeds: 64.80 },
    { year: 2001, ipos: 80, firstDayEW: 14.00, firstDayPW: 8.40, firstDayMedian: 10.20, leftOnTable: 2.97, proceeds: 35.29 },
    { year: 2002, ipos: 66, firstDayEW: 9.10, firstDayPW: 5.10, firstDayMedian: 8.20, leftOnTable: 1.13, proceeds: 22.03 },
    { year: 2003, ipos: 63, firstDayEW: 11.70, firstDayPW: 10.40, firstDayMedian: 8.70, leftOnTable: 1.00, proceeds: 9.54 },
    { year: 2004, ipos: 173, firstDayEW: 12.30, firstDayPW: 12.40, firstDayMedian: 7.10, leftOnTable: 3.86, proceeds: 31.19 },
    { year: 2005, ipos: 159, firstDayEW: 10.30, firstDayPW: 9.30, firstDayMedian: 5.80, leftOnTable: 2.64, proceeds: 28.23 },
    { year: 2006, ipos: 157, firstDayEW: 12.10, firstDayPW: 13.00, firstDayMedian: 5.60, leftOnTable: 3.95, proceeds: 30.48 },
    { year: 2007, ipos: 159, firstDayEW: 14.00, firstDayPW: 13.90, firstDayMedian: 6.80, leftOnTable: 4.95, proceeds: 35.66 },
    { year: 2008, ipos: 21, firstDayEW: 5.70, firstDayPW: 24.70, firstDayMedian: -1.70, leftOnTable: 5.63, proceeds: 22.76 },
    { year: 2009, ipos: 41, firstDayEW: 9.80, firstDayPW: 11.10, firstDayMedian: 5.70, leftOnTable: 1.46, proceeds: 13.17 },
    { year: 2010, ipos: 91, firstDayEW: 9.40, firstDayPW: 6.20, firstDayMedian: 3.10, leftOnTable: 1.84, proceeds: 29.82 },
    { year: 2011, ipos: 81, firstDayEW: 13.90, firstDayPW: 13.00, firstDayMedian: 8.50, leftOnTable: 3.51, proceeds: 26.97 },
    { year: 2012, ipos: 93, firstDayEW: 17.70, firstDayPW: 8.90, firstDayMedian: 11.10, leftOnTable: 2.75, proceeds: 31.11 },
    { year: 2013, ipos: 158, firstDayEW: 20.90, firstDayPW: 19.00, firstDayMedian: 13.00, leftOnTable: 7.89, proceeds: 41.56 },
    { year: 2014, ipos: 206, firstDayEW: 15.50, firstDayPW: 12.80, firstDayMedian: 5.80, leftOnTable: 5.40, proceeds: 42.20 },
    { year: 2015, ipos: 118, firstDayEW: 19.20, firstDayPW: 18.90, firstDayMedian: 10.30, leftOnTable: 4.16, proceeds: 22.00 },
    { year: 2016, ipos: 75, firstDayEW: 14.50, firstDayPW: 14.20, firstDayMedian: 5.00, leftOnTable: 1.77, proceeds: 12.52 },
    { year: 2017, ipos: 106, firstDayEW: 12.90, firstDayPW: 16.00, firstDayMedian: 9.00, leftOnTable: 3.68, proceeds: 22.98 },
    { year: 2018, ipos: 134, firstDayEW: 18.60, firstDayPW: 19.10, firstDayMedian: 11.60, leftOnTable: 6.39, proceeds: 33.47 },
    { year: 2019, ipos: 113, firstDayEW: 23.50, firstDayPW: 17.60, firstDayMedian: 17.90, leftOnTable: 6.95, proceeds: 39.28 },
    { year: 2020, ipos: 165, firstDayEW: 41.60, firstDayPW: 47.90, firstDayMedian: 26.20, leftOnTable: 29.66, proceeds: 61.86 },
    { year: 2021, ipos: 311, firstDayEW: 32.10, firstDayPW: 24.00, firstDayMedian: 17.00, leftOnTable: 28.65, proceeds: 119.36 },
    { year: 2022, ipos: 38, firstDayEW: 48.90, firstDayPW: 14.20, firstDayMedian: 9.30, leftOnTable: 0.99, proceeds: 6.99 },
    { year: 2023, ipos: 54, firstDayEW: 11.90, firstDayPW: 16.10, firstDayMedian: -0.50, leftOnTable: 1.92, proceeds: 11.92 },
    { year: 2024, ipos: 72, firstDayEW: 15.30, firstDayPW: 18.10, firstDayMedian: 7.20, leftOnTable: 3.72, proceeds: 20.49 },
    { year: 2025, ipos: 90, firstDayEW: 29.30, firstDayPW: 33.60, firstDayMedian: 13.70, leftOnTable: 13.11, proceeds: 38.97 },
];

export default function IPODataPage() {
    return <IPOChart data={IPO_DATA} />;
}
