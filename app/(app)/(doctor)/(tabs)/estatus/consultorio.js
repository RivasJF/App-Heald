import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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

  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      getDoctorByUserId(user.id)
        .then(doctorProfile => {
          if (!doctorProfile?.id) {
            throw new Error("Perfil de doctor no encontrado.");
          }
          return getClinicByDoctorId(doctorProfile.id);
        })
        .then(clinicData => {
          if (clinicData) {
            setAddress(clinicData.address);
            setLatitude(String(clinicData.latitude));
            setLongitude(String(clinicData.longitude));
          }
          setError(null);
        })
        .catch(err => {
          console.error("Error al cargar datos del consultorio:", err);
          setError("No se pudieron cargar los datos del consultorio.");
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

        <View style={styles.infoCard}>
          <InfoRow icon="map-marker" label="Dirección Completa" value={address} />
          <InfoRow icon="compass" label="Coordenadas (Lat, Lng)" value={latitude && longitude ? `${latitude}, ${longitude}` : 'No disponible'} />
        </View>
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
});
