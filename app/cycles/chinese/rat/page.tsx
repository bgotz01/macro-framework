import ZodiacPage from '@/components/zodiac/zodiac-page';
import { zodiacData } from '@/lib/zodiac';

export default function RatPage() {
    return <ZodiacPage data={zodiacData.rat} />;
}
