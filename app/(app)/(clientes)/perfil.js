import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Perfil() {
  const { signOut, user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Mi Perfil' }} />
      <Text style={styles.title}>Datos del Usuario</Text>

      {/* Aquí puedes mostrar más datos del usuario */}
      <Text style={styles.userInfo}>Nombre: {user?.name || 'No disponible'}</Text>
      <Text style={styles.userInfo}>Email: {user?.email || 'No disponible'}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F8FF',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#072B66',
    marginBottom: 20,
  },
  userInfo: { fontSize: 16, color: '#4B6AA3', marginBottom: 10 },
  logoutButton: { backgroundColor: '#FF6347', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  logoutButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});