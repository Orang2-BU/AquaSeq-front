import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFound() {
  return (
    <View style={styles.page}>
      <Text accessibilityRole="header" style={styles.title}>
        Halaman tidak ditemukan
      </Text>
      <Link href="/" style={styles.link}>
        Kembali ke awal
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  title: { fontSize: 22, fontWeight: '600' },
  link: { fontSize: 16, padding: 12 },
});
