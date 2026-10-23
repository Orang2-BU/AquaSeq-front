import { useLocalSearchParams } from 'expo-router';

import { PondDetailScreen } from '@/features/tambak';

export default function Route() {
  const p = useLocalSearchParams<{ pondId: string }>();
  return <PondDetailScreen pondId={p.pondId} />;
}
