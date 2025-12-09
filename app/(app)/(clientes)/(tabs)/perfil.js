import { Stack, Link } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { getProfile } from '../../../../src/services/authService';

export default function Perfil() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getProfile();
        setProfile(profileData);
        setError(null);
      } catch (e) {
        setError('No se pudieron cargar los datos del perfil.');
        console.error('Error fetching profile:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formattedBirthDate = profile?.birthDate
    ? new Date(profile.birthDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'No disponible';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Datos del Usuario</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0B4EF2" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.infoCard}>
          <InfoRow icon="user" label="Nombre" value={profile?.name} />
          <InfoRow icon="envelope" label="Email" value={profile?.email} />
          <InfoRow icon="phone" label="Teléfono" value={profile?.phoneNumber} />
          <InfoRow icon="calendar" label="Fecha de nacimiento" value={formattedBirthDate} />
        </View>
      )}

      <View style={styles.menuContainer}>
        <Link href="/(app)/(clientes)/(perfil)/configuracion" asChild>
          <TouchableOpacity style={styles.menuButton}>
            <FontAwesome name="cog" size={20} color="#4B6AA3" />
            <Text style={styles.menuButtonText}>Configuración</Text>
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

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <FontAwesome name={icon} size={18} color="#4B6AA3" style={styles.infoIcon} />
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'No disponible'}</Text>
    </View>
  </View>
);

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
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  infoIcon: {
    width: 25,
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B82B1',
  },
  infoValue: { fontSize: 16, color: '#072B66', fontWeight: '600', marginTop: 2 },
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
  errorText: {
    textAlign: 'center',
    color: '#D9534F',
    marginTop: 20,
    fontSize: 16,
  },
});