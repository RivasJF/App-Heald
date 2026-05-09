import { FontAwesome } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { getDoctorByUserId } from '../../../../../src/services/doctorService';

export default function DoctorProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDarkMode, colors, toggleTheme } = useTheme();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctorProfile = useCallback(async () => {
    if (user?.id) {
      try {
        setLoading(true);
        const profileData = await getDoctorByUserId(user.id);
        setDoctorProfile(profileData);
        setError(null);
      } catch (e) {
        // Si el doctor no tiene perfil (404), lo redirigimos a la pantalla de creación.
        if (e?.statusCode === 404) {
          // Navegamos a la pantalla de crear perfil dentro del layout del doctor
          router.replace('/(doctor)/crear-perfil');
        } else {
          setError('No se pudo cargar el perfil del doctor.');
          console.error('Error fetching doctor profile:', e);
        }
      } finally {
        setLoading(false);
      }
    }
  }, [user, router]);

  useFocusEffect(
    useCallback(() => {
      fetchDoctorProfile();
    }, [fetchDoctorProfile])
  );

  // Muestra un loader mientras se determina si el perfil existe o no.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors?.background || '#F5F8FF' }}>
        <ActivityIndicator size="large" color={colors?.primary || "#3F51B5"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerSideSpacer} />
          <Text style={[styles.title, { color: colors.text }]}>Mi Perfil</Text>
          <TouchableOpacity onPress={fetchDoctorProfile} disabled={loading}>
            <FontAwesome name="refresh" size={24} color={loading ? '#B0C4DE' : colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>Bienvenido, Dr. {user?.name || '...'}</Text>
        {loading ? (
          <ActivityIndicator color="#6B82B1" style={{ alignSelf: 'flex-start', marginTop: 5 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={[styles.infoCard, { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#072B66' }]}>
            <InfoRow icon="user-md" label="Nombre" value={`Dr. ${user?.name}`} colors={colors} />
            <InfoRow icon="envelope-o" label="Email" value={user?.email} colors={colors} />
            <InfoRow icon="stethoscope" label="Especialidad" value={doctorProfile?.speciality} colors={colors} />
            <InfoRow icon="info-circle" label="Biografía" value={doctorProfile?.biography} colors={colors} />
            <StatusRow active={doctorProfile?.serviceStatus?.active} colors={colors} />

            {/* Selector de Apariencia */}
            <View style={[styles.infoRow, { justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 15, marginBottom: 0 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome name="moon-o" size={18} color={colors.primary} style={styles.infoIcon} />
                <View>
                  <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Apariencia</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}</Text>
                </View>
              </View>
              <Switch 
                value={isDarkMode} 
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={isDarkMode ? colors.white : '#f4f3f4'}
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <FontAwesome name="sign-out" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value, colors }) => (
  <View style={styles.infoRow}>
    <FontAwesome name={icon} size={18} color={colors.primary} style={styles.infoIcon} />
    <View>
      <Text style={[styles.infoLabel, { color: colors.subtitle }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value || 'No disponible'}</Text>
    </View>
  </View>
);

const StatusRow = ({ active, colors }) => {
  const statusText = active ? 'Activo' : 'Inactivo';
  const statusColor = active ? '#28A745' : '#DC3545'; // Verde para activo, Rojo para inactivo

  return (
    <View style={styles.infoRow}>
      <FontAwesome name="power-off" size={18} color={colors.primary} style={styles.infoIcon} />
      <View>
        <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Estado del Servicio</Text>
        <Text style={[styles.statusValue, { color: statusColor }]}>{statusText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  header: {
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSideSpacer: {
    width: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginTop: 'auto', // Empuja el botón de logout hacia abajo
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: '#072B66',
  },
  subtitle: {
    fontSize: 16,
    textAlign:'center',
    color: '#6B82B1',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#D9534F',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#D9534F',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
  errorText: {
    color: '#D9534F',
    marginTop: 5,
    fontSize: 14,
    fontStyle: 'italic',
  },
  // Estilos que estaban en infoStyles ahora están aquí
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  infoIcon: { width: 25, marginRight: 15 },
  infoLabel: { fontSize: 13, color: '#6B82B1' },
  infoValue: { fontSize: 16, color: '#072B66', fontWeight: '600', marginTop: 2 },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
});