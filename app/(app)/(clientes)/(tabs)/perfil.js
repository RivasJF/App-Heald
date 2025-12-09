import { Stack, Link } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

export default function Perfil() {
  const { signOut, user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Mi Perfil', headerShown: true }} />
      <Text style={styles.title}>Datos del Usuario</Text>

      {/* Aquí puedes mostrar más datos del usuario */}
      <Text style={styles.userInfo}>Nombre: {user?.name || 'No disponible'}</Text>
      <Text style={styles.userInfo}>Email: {user?.email || 'No disponible'}</Text>

      <View style={styles.menuContainer}>
        <Link href="/(app)/(clientes)/(perfil)/configuracion" asChild>
          <TouchableOpacity style={styles.menuButton}>
            <FontAwesome name="cog" size={20} color="#4B6AA3" />
            <Text style={styles.menuButtonText}>Configuración</Text>
            <FontAwesome name="angle-right" size={24} color="#4B6AA3" />
          </TouchableOpacity>
        </Link>

        <View style={styles.separator} />

        <Link href="/(app)/(clientes)/(perfil)/ayuda" asChild>
          <TouchableOpacity style={styles.menuButton}>
            <FontAwesome name="question-circle" size={20} color="#4B6AA3" />
            <Text style={styles.menuButtonText}>Centro de Ayuda</Text>
            <FontAwesome name="angle-right" size={24} color="#4B6AA3" />
          </TouchableOpacity>
        </Link>
      </View>

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
  userInfo: { fontSize: 16, color: '#4B6AA3', marginBottom: 10, marginLeft: 5 },
  menuContainer: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuButtonText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#072B66',
    fontWeight: '600',
  },
  separator: { height: 1, backgroundColor: '#F0F4F8', marginHorizontal: 20 },
  logoutButton: { backgroundColor: '#FF6347', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 40 },
  logoutButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});