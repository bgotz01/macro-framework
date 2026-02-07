import ZodiacPage from '../../../components/zodiac/zodiac-page';
import { zodiacData } from '../../../lib/zodiac';

export default function OxPage() {
    return <ZodiacPage data={zodiacData.ox} />;
}
