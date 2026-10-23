import { useLocalSearchParams } from 'expo-router';

import { PublishScreen } from '@/features/sample';

export default function Route() {
  const p = useLocalSearchParams<{ sampleId: string }>();
  return <PublishScreen sampleId={p.sampleId} />;
}
