import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

const CDMX_TIME_ZONE = 'America/Mexico_City';

export default function DoctorCitaDetalle() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cita: citaString } = params;

  const cita = citaString ? JSON.parse(citaString) : null;

  const formatDateInCDMX = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTimeInCDMX = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: CDMX_TIME_ZONE,
    });
  };

  if (!cita) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar la información de la cita.</Text>
      </SafeAreaView>
    );
  }

  // Formato de fecha y hora
  const appointmentDate = formatDateInCDMX(cita.startTime);
  const startTime = formatTimeInCDMX(cita.startTime);
  const endTime = formatTimeInCDMX(cita.endTime);
  const timeRange = `${startTime} - ${endTime}`;

  // Información del paciente
  const patientName = cita.patient?.name || 'No asignado';
  const clinicAddress = cita.clinicLocation.address || 'Dirección no disponible';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>← Mis Citas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Cita con {patientName}</Text>
            <Text style={styles.cardSubtitle}>ID de Cita: {cita.id}</Text>
          </View>
          <View style={styles.cardBody}>
            <DetailRow icon="calendar" label="Fecha" value={appointmentDate} />
            <DetailRow icon="clock-o" label="Horario" value={timeRange} />
            <DetailRow icon="hospital-o" label="Ubicación" value={clinicAddress} />
          </View>
        </View>

        <View style={styles.patientCard}>
          <Text style={styles.sectionTitle}>Información del Paciente</Text>
          <DetailRow icon="user" label="Nombre" value={cita.patient?.name} />
          <DetailRow icon="envelope" label="Email" value={cita.patient?.email} />
          <DetailRow icon="phone" label="Teléfono" value={cita.patient?.phoneNumber} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <FontAwesome name={icon} size={18} color="#4B6AA3" style={styles.detailIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'No disponible'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  scrollContainer: { padding: 24, paddingTop: 10, paddingBottom: 40 },
  headerRow: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },
  linkText: {
    color: '#3F51B5',
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    marginBottom: 24,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    backgroundColor: '#E8EAF6',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#C5CAE9',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#072B66',
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F51B5',
    marginTop: 4,
  },
  cardBody: {
    padding: 20,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#072B66',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAF6',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailIcon: {
    width: 22,
    marginRight: 16,
    marginTop: 3,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B82B1',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#072B66',
    fontWeight: '600',
    lineHeight: 22,
  },
  errorText: {
    textAlign: 'center',
    color: '#D9534F',
    marginTop: 30,
    fontSize: 16,
    padding: 24,
  },
});