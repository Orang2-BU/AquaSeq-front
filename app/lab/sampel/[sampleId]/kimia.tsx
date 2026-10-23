import { useLocalSearchParams } from 'expo-router';

import { ChemistryScreen } from '@/features/sample';

export default function Route() {
  const p = useLocalSearchParams<{ sampleId: string }>();
  return <ChemistryScreen sampleId={p.sampleId} />;
}
