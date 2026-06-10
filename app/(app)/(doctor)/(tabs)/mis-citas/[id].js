import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../../src/context/ThemeContext';

const CDMX_TIME_ZONE = 'America/Mexico_City';

export default function DoctorCitaDetalle() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDarkMode, statusBarStyle } = useTheme();
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>No se pudo cargar la información de la cita.</Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={statusBarStyle} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.linkText, { color: colors.primary }]}>← Mis Citas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[
          styles.card, 
          { 
            backgroundColor: colors.card, 
            shadowColor: isDarkMode ? '#000' : '#072B66',
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: colors.border
          }]}>
          <View style={[styles.cardHeader, { backgroundColor: isDarkMode ? colors.border : '#E8EAF6', borderBottomColor: isDarkMode ? colors.border : '#C5CAE9' }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Cita con {patientName}</Text>
            <Text style={[styles.cardSubtitle, { color: isDarkMode ? colors.primary : '#3F51B5' }]}>ID de Cita: {cita.id}</Text>
          </View>
          <View style={styles.cardBody}>
            <DetailRow icon="calendar" label="Fecha" value={appointmentDate} colors={colors} />
            <DetailRow icon="clock-o" label="Horario" value={timeRange} colors={colors} />
            <DetailRow icon="hospital-o" label="Ubicación" value={clinicAddress} colors={colors} />
          </View>
        </View>

        <View style={[
          styles.patientCard, 
          { 
            backgroundColor: colors.card, 
            shadowColor: isDarkMode ? '#000' : '#072B66',
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: colors.border
          }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>Información del Paciente</Text>
          <DetailRow icon="user" label="Nombre" value={cita.patient?.name} colors={colors} />
          <DetailRow icon="envelope" label="Email" value={cita.patient?.email} colors={colors} />
          <DetailRow icon="phone" label="Teléfono" value={cita.patient?.phoneNumber} colors={colors} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ icon, label, value, colors }) => (
  <View style={styles.detailRow}>
    <FontAwesome name={icon} size={18} color={colors.primary} style={styles.detailIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={[styles.detailLabel, { color: colors.subtitle }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value || 'No disponible'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 24, paddingTop: 10, paddingBottom: 40 },
  headerRow: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },
  linkText: {
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    borderRadius: 12,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    marginBottom: 24,
  },
  patientCard: {
    borderRadius: 12,
    padding: 20,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  cardBody: {
    padding: 20,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    borderBottomWidth: 1,
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
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    padding: 24,
  },
});