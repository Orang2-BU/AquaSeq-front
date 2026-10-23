import { useLocalSearchParams } from 'expo-router';

import { ResultScreen } from '@/features/sample';

export default function Route() {
  const p = useLocalSearchParams<{ sampleId: string }>();
  return <ResultScreen sampleId={p.sampleId} />;
}
