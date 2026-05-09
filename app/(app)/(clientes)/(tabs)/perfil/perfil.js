import { FontAwesome } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { useTheme } from '../../../../../src/context/ThemeContext';

export default function PatientProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDarkMode, colors, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // En una aplicación real, aquí cargarías los datos específicos del perfil del paciente
  // Por ahora, solo simulamos la carga y usamos los datos del 'user' del AuthContext.
  const fetchPatientProfile = useCallback(async () => {
    if (user?.id) {
      try {
        setLoading(true);
        // Simulación de carga de datos del paciente
        await new Promise(resolve => setTimeout(resolve, 500)); 
        setError(null);
      } catch (e) {
        setError('No se pudo cargar el perfil del paciente.');
        console.error('Error fetching patient profile:', e);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchPatientProfile();
    }, [fetchPatientProfile])
  );

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabecera con Avatar */}
        <View style={[styles.headerGradient, { backgroundColor: colors.primary }]}>
          <View style={styles.topActions}>
            <TouchableOpacity onPress={fetchPatientProfile} style={styles.iconButton}>
              <FontAwesome name="refresh" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfoContainer}>
            <View style={[styles.avatarBorder, { borderColor: colors.background }]}>
              <FontAwesome name="user" size={60} color={colors.white} />
            </View>
            <Text style={[styles.patientName, { color: colors.white }]}>{user?.name || 'Paciente'}</Text>
            <Text style={[styles.patientSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
              Miembro desde {new Date().getFullYear()}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Barra de Estadísticas (Valores de ejemplo) */}
          <View style={[styles.statsBar, { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#072B66' }]}>
            <StatItem label="Citas" value="--" icon="calendar" colors={colors} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatItem label="Doctores" value="--" icon="user-md" colors={colors} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatItem label="Historial" value="--" icon="history" colors={colors} />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Información Personal */}
          <Text style={[styles.sectionTitle, { color: colors.subtitle }]}>INFORMACIÓN PERSONAL</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#072B66' }]}>
            <InfoRow icon="envelope" label="Correo Electrónico" value={user?.email} colors={colors} />
            <InfoRow icon="phone" label="Teléfono" value={user?.phoneNumber || 'No disponible'} colors={colors} />
            <InfoRow icon="birthday-cake" label="Fecha de Nacimiento" value={user?.birthDate || 'No disponible'} colors={colors} />
          </View>

          {/* Ajustes */}
          <Text style={[styles.sectionTitle, { color: colors.subtitle }]}>PREFERENCIAS</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#072B66' }]}>
            <View style={styles.settingsRow}>
              <View style={styles.settingsLabelGroup}>
                <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
                  <FontAwesome name={isDarkMode ? "moon-o" : "sun-o"} size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.settingsLabel, { color: colors.text }]}>Modo de Apariencia</Text>
                  <Text style={[styles.settingsSubLabel, { color: colors.subtitle }]}>
                    {isDarkMode ? 'Oscuro' : 'Claro'}
                  </Text>
                </View>
              </View>
              <Switch 
                value={isDarkMode} 
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: isDarkMode ? 'transparent' : '#D9534F', borderWidth: isDarkMode ? 1 : 0, borderColor: colors.error }]} 
          onPress={signOut}
        >
          <FontAwesome name="sign-out" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value, colors }) => (
  <View style={styles.infoRow}>
    <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
      <FontAwesome name={icon} size={14} color={colors.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={[styles.infoLabel, { color: colors.subtitle }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value || 'No disponible'}</Text>
    </View>
  </View>
);

const StatItem = ({ label, value, icon, colors }) => (
  <View style={styles.statItem}>
    <FontAwesome name={icon} size={16} color={colors.primary} />
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.subtitle }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  topActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  profileInfoContainer: {
    alignItems: 'center',
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  patientName: { fontSize: 22, fontWeight: '800' },
  patientSubtitle: { fontSize: 14, fontWeight: '500', marginBottom: 12 },
  body: { paddingHorizontal: 24, marginTop: -30 },
  statsBar: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 15,
    marginBottom: 25,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', marginVertical: 2 },
  statLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  statDivider: { width: 1, height: '70%', alignSelf: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginTop: 5 },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600' },
  infoValue: { fontSize: 15, fontWeight: '600', marginTop: 1 },
  divider: { height: 1, marginVertical: 15 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingsLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  settingsLabel: { fontSize: 15, fontWeight: '600' },
  settingsSubLabel: { fontSize: 12, fontWeight: '500' },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
});