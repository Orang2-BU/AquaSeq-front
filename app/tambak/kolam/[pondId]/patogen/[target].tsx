import { useLocalSearchParams } from 'expo-router';

import type { Pathogen } from '@/engine/types';
import { PathogenScreen } from '@/features/tambak';

export default function Route() {
  const p = useLocalSearchParams<{ pondId: string; target: string }>();
  const target: Pathogen = p.target === 'vp28' || p.target === 'swp1' ? p.target : 'pirA';
  return <PathogenScreen pondId={p.pondId} target={target} />;
}
