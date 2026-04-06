import ZodiacPage from '@/components/zodiac/zodiac-page';
import { zodiacData } from '@/lib/zodiac';

export default function DogPage() {
    return <ZodiacPage data={zodiacData.dog} />;
}
