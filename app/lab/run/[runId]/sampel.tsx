import { useLocalSearchParams } from 'expo-router';

import { RunSamplesScreen } from '@/features/lab';

export default function Route() {
  const p = useLocalSearchParams<{ runId: string }>();
  return <RunSamplesScreen runId={p.runId} />;
}
