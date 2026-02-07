import ZodiacPage from '../../../components/zodiac/zodiac-page';
import { zodiacData } from '../../../lib/zodiac';

export default function MonkeyPage() {
    return <ZodiacPage data={zodiacData.monkey} />;
}
