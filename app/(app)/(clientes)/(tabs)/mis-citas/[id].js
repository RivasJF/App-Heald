import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

export default function CitaDetalle() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cita: citaString } = params;

  // Parseamos el string JSON para obtener el objeto de la cita
  const cita = citaString ? JSON.parse(citaString) : null;

  if (!cita) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar la información de la cita.</Text>
      </SafeAreaView>
    );
  }

  const fecha = new Date(cita.startTime).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const horaInicio = new Date(cita.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const horaFin = new Date(cita.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const doctorName = cita.doctor.user?.name || 'Doctor';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Detalle de la Cita', headerShown: false }} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>← Mis Citas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{doctorName}</Text>
            <Text style={styles.cardSubtitle}>{cita.doctor.speciality}</Text>
          </View>
          <View style={styles.cardBody}>
            <DetailRow icon="calendar" label="Fecha" value={fecha} />
            <DetailRow icon="clock-o" label="Horario" value={`${horaInicio} - ${horaFin} hrs.`} />
            <DetailRow icon="map-marker" label="Ubicación" value={cita.clinicLocation.address} />
            <DetailRow icon="info-circle" label="ID de Cita" value={cita.id} />
          </View>
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
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  scrollContainer: { padding: 24, paddingTop: 10 },
  headerRow: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },
  linkText: {
    color: '#0B4EF2',
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
  },
  cardHeader: {
    backgroundColor: '#EAF1FF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D7E8FF',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#072B66',
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#36548B',
    marginTop: 4,
  },
  cardBody: {
    padding: 20,
    gap: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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