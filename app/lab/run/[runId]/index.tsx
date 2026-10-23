import { useLocalSearchParams } from 'expo-router';

import { RunQcScreen } from '@/features/lab';

export default function Route() {
  const p = useLocalSearchParams<{ runId: string }>();
  return <RunQcScreen runId={p.runId} />;
}
