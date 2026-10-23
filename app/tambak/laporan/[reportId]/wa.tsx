import { useLocalSearchParams } from 'expo-router';

import { WaScreen } from '@/features/tambak';

export default function Route() {
  const p = useLocalSearchParams<{ reportId: string }>();
  return <WaScreen reportId={p.reportId} />;
}
