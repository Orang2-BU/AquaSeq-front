import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Layar sementara T1.2: membuktikan rute bisa dibuka sebelum layar aslinya dibangun.
export function Placeholder({ title }: { title: string }) {
  const params = useLocalSearchParams();
  const detail = Object.entries(params)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(' · ');
  return (
    <View style={styles.page}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20 },
  title: { fontSize: 22, fontWeight: '600' },
  detail: { fontSize: 14 },
});
