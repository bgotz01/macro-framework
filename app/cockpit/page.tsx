import CockpitClient from './cockpit-client';
import { getCockpitData } from './cockpit-data';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CockpitPage() {
    const data = await getCockpitData();
    return <CockpitClient data={data} />;
}
