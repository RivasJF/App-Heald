import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { getDoctorByUserId } from '../../../../../src/services/doctorService';
import { getClinicByDoctorId } from '../../../../../src/services/clinicService';
import { FontAwesome } from '@expo/vector-icons';

export default function Consultorio() {
  const router = useRouter();
  const { user } = useAuth();

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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={{ marginTop: 10 }}>Cargando datos del consultorio...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Panel de Control</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Mi Consultorio</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {clinicExists ? (
          <>
            <View style={styles.infoCard}>
              <InfoRow icon="map-marker" label="Dirección Completa" value={clinic?.address} />
              <InfoRow icon="compass" label="Coordenadas (Lat, Lng)" value={clinic ? `${clinic.latitude}, ${clinic.longitude}` : 'No disponible'} />
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push({
                pathname: '/(app)/(doctor)/estatus/ubicacion-consultorio',
                params: { clinic: JSON.stringify(clinic) }
              })}
            >
              <Text style={styles.editButtonText}>Actualizar Ubicación</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.noClinicContainer}>
            <Text style={styles.noClinicText}>Aún no has registrado un consultorio.</Text>
            <TouchableOpacity
              style={styles.createButton}
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

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <FontAwesome name={icon} size={20} color="#4B6AA3" style={styles.infoIcon} />
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'No disponible'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F8FF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#F5F8FF" },
  backButton: { alignSelf: 'flex-start', marginBottom: 10 },
  backButtonText: { color: '#3F51B5', fontSize: 16, fontWeight: "700" },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#072B66',
    marginBottom: 20,
    textAlign: 'center',
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
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  infoIcon: { width: 25, marginRight: 15, marginTop: 3 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 13, color: '#6B82B1', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#072B66', fontWeight: '600', lineHeight: 22 },
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
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
  },
  noClinicText: {
    fontSize: 16,
    color: '#6B82B1',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#3F51B5',
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
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3F51B5',
  },
  editButtonText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
