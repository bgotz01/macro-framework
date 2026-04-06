import ZodiacPage from '@/components/zodiac/zodiac-page';
import { zodiacData } from '@/lib/zodiac';

export default function SnakePage() {
    return <ZodiacPage data={zodiacData.snake} />;
}
