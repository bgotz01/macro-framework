import ZodiacPage from '@/components/zodiac/zodiac-page';
import { zodiacData } from '@/lib/zodiac';

export default function HorsePage() {
    return <ZodiacPage data={zodiacData.horse} />;
}
