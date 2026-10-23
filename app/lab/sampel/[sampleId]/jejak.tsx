import { useLocalSearchParams } from 'expo-router';

import { TraceScreen } from '@/features/sample';

export default function Route() {
  const p = useLocalSearchParams<{ sampleId: string }>();
  return <TraceScreen sampleId={p.sampleId} />;
}
