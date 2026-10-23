import { useLocalSearchParams } from 'expo-router';

import { WellScreen } from '@/features/lab';

export default function Route() {
  const p = useLocalSearchParams<{ runId: string; wellId: string }>();
  return <WellScreen runId={p.runId} wellId={p.wellId} />;
}
