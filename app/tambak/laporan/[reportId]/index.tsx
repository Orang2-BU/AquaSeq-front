import { useLocalSearchParams } from 'expo-router';

import { ReportScreen } from '@/features/tambak';

export default function Route() {
  const p = useLocalSearchParams<{ reportId: string }>();
  return <ReportScreen reportId={p.reportId} />;
}
