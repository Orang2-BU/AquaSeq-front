import { useLocalSearchParams } from 'expo-router';

import { CurveScreen } from '@/features/lab';

export default function Route() {
  const p = useLocalSearchParams<{ runId: string }>();
  return <CurveScreen runId={p.runId} />;
}
