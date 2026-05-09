import { FontAwesome } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { getDoctorByUserId } from '../../../../../src/services/doctorService';

export default function DoctorProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDarkMode, colors, toggleTheme, statusBarStyle } = useTheme();
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
      <StatusBar style={statusBarStyle} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabecera con Avatar */}
        <View style={[styles.headerGradient, { backgroundColor: colors.primary }]}>
          <View style={styles.topActions}>
            <TouchableOpacity onPress={fetchDoctorProfile} style={styles.iconButton}>
              <FontAwesome name="refresh" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfoContainer}>
            <View style={[styles.avatarBorder, { borderColor: colors.background }]}>
              <FontAwesome name="user-md" size={60} color={colors.white} />
            </View>
            <Text style={[styles.doctorName, { color: colors.white }]}>Dr. {user?.name}</Text>
            <Text style={[styles.doctorSpecialty, { color: 'rgba(255,255,255,0.8)' }]}>
              {doctorProfile?.speciality || 'Especialista'}
            </Text>
            <StatusBadge active={doctorProfile?.serviceStatus?.active} />
          </View>
        </View>

        <View style={styles.body}>
          {/* Barra de Estadísticas (Valores de ejemplo) */}
          <View style={[
            styles.statsBar, 
            { 
              backgroundColor: colors.card, 
              shadowColor: isDarkMode ? '#000' : '#072B66',
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border
            }]}>
            <StatItem label="Citas" value="--" icon="calendar" colors={colors} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatItem label="Pacientes" value="--" icon="users" colors={colors} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatItem label="Rating" value="5.0" icon="star" colors={colors} />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Información Profesional */}
          <Text style={[styles.sectionTitle, { color: colors.subtitle }]}>INFORMACIÓN PROFESIONAL</Text>
          <View style={[
            styles.infoCard, 
            { 
              backgroundColor: colors.card, 
              shadowColor: isDarkMode ? '#000' : '#072B66',
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border
            }]}>
            <InfoRow icon="envelope" label="Correo Electrónico" value={user?.email} colors={colors} />
            <InfoRow icon="id-card" label="Cédula Profesional" value="Verificada" colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.bioLabel, { color: colors.subtitle }]}>Biografía</Text>
            <Text style={[styles.bioText, { color: colors.text }]}>
              {doctorProfile?.biography || 'Sin biografía disponible.'}
            </Text>
          </View>

          {/* Ajustes */}
          <Text style={[styles.sectionTitle, { color: colors.subtitle }]}>PREFERENCIAS</Text>
          <View style={[
            styles.infoCard, 
            { 
              backgroundColor: colors.card, 
              shadowColor: isDarkMode ? '#000' : '#072B66',
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border
            }]}>
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

const StatusBadge = ({ active }) => {
  return (
    <View style={[styles.badgeContainer, { backgroundColor: active ? '#4ade8022' : '#f8717122' }]}>
      <View style={[styles.badgeDot, { backgroundColor: active ? '#4ade80' : '#f87171' }]} />
      <Text style={[styles.badgeText, { color: active ? '#4ade80' : '#f87171' }]}>
        {active ? 'Consultorio Activo' : 'Fuera de Servicio'}
      </Text>
    </View>
  );
};

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
    overflow: 'hidden',
    position: 'relative',
  },
  doctorName: { fontSize: 22, fontWeight: '800' },
  doctorSpecialty: { fontSize: 14, fontWeight: '500', marginBottom: 12 },
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
  bioLabel: { fontSize: 11, fontWeight: '600', marginBottom: 6 },
  bioText: { fontSize: 14, lineHeight: 20 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingsLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  settingsLabel: { fontSize: 15, fontWeight: '600' },
  settingsSubLabel: { fontSize: 12, fontWeight: '500' },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
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