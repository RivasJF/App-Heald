import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MisCitas() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Mis Citas' }} />
      <Text style={styles.title}>Mis Citas Creadas</Text>
      {/* Aquí se listarán las citas del usuario */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F8FF' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#072B66',
  },
});