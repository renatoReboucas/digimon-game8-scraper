// @ts-nocheck
import DigimonAtlas from '@/components/digimon-atlas';
import { loadDigimonData } from '@/lib/digimon-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    const digimons = await loadDigimonData();
    return <DigimonAtlas digimons={digimons} />;
  } catch (error) {
    return <DigimonAtlas digimons={[]} loadError={error.message} />;
  }
}
