import { useLocalSearchParams } from 'expo-router';

import { NanoporeScreen } from '@/features/sample';

export default function Route() {
  const p = useLocalSearchParams<{ sampleId: string }>();
  return <NanoporeScreen sampleId={p.sampleId} />;
}
