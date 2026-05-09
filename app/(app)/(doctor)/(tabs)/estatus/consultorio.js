import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { getClinicByDoctorId } from '../../../../../src/services/clinicService';
import { getDoctorByUserId } from '../../../../../src/services/doctorService';

export default function Consultorio() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [clinic, setClinic] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clinicExists, setClinicExists] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      getDoctorByUserId(user.id)
        .then(doctorProfile => {
          if (!doctorProfile?.id) {
            throw new Error("Perfil de doctor no encontrado.");
          }
          setDoctorProfile(doctorProfile);
          return getClinicByDoctorId(doctorProfile.id);
        })
        .then(clinicData => {
          setClinic(clinicData);
          setClinicExists(true);
          setError(null);
        })
        .catch(err => {
          if (err?.statusCode === 404) {
            setClinicExists(false);
            setError(null);
          } else {
            console.error("Error al cargar datos del consultorio:", err);
            setError("No se pudieron cargar los datos del consultorio.");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>Cargando datos del consultorio...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Panel de Control</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Mi Consultorio</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {clinicExists ? (
          <>
            <View style={[styles.infoCard, { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#072B66' }]}>
              <InfoRow icon="map-marker" label="Dirección Completa" value={clinic?.address} colors={colors} />
              <InfoRow icon="compass" label="Coordenadas (Lat, Lng)" value={clinic ? `${clinic.latitude}, ${clinic.longitude}` : 'No disponible'} colors={colors} />
            </View>
            <TouchableOpacity
              style={[styles.editButton, { borderColor: colors.primary }]}
              onPress={() => router.push({
                pathname: '/(app)/(doctor)/estatus/ubicacion-consultorio',
                params: { clinic: JSON.stringify(clinic) }
              })}
            >
              <Text style={[styles.editButtonText, { color: colors.primary }]}>Actualizar Ubicación</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.noClinicContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.noClinicText, { color: colors.subtitle }]}>Aún no has registrado un consultorio.</Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push({ pathname: '/(app)/(doctor)/crear-consultorio', params: { doctorId: doctorProfile.id } })}
            >
              <Text style={styles.createButtonText}>Registrar Mi Consultorio</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value, colors }) => (
  <View style={styles.infoRow}>
    <FontAwesome name={icon} size={20} color={colors.primary} style={styles.infoIcon} />
    <View style={styles.infoTextContainer}>
      <Text style={[styles.infoLabel, { color: colors.subtitle }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value || 'No disponible'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 10 },
  backButtonText: { fontSize: 16, fontWeight: "700" },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  infoIcon: { width: 25, marginRight: 15, marginTop: 3 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 13, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  errorText: {
    textAlign: 'center',
    color: '#D32F2F',
    marginBottom: 15,
    fontSize: 15,
  },
  noClinicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 12,
    marginTop: 20,
  },
  noClinicText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
