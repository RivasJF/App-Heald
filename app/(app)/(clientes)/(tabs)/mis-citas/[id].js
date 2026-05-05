import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { cancelAppointment } from '../../../../../src/services/appointmentService';

const CDMX_TIME_ZONE = 'America/Mexico_City';

export default function CitaDetalle() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cita: citaString } = params;

  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Parseamos el string JSON para obtener el objeto de la cita
  const cita = citaString ? JSON.parse(citaString) : null;

  const parseLocal = (isoString) => {
    if (!isoString) return new Date(isoString);
    try {
      if (typeof isoString === 'string' && isoString.endsWith('Z')) {
        return new Date(isoString.slice(0, -1));
      }
      return new Date(isoString);
    } catch (error) {
      return new Date(isoString);
    }
  };

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
  const timeRange = `${startTime} - ${endTime} hrs.`;

  // Información del doctor
  const doctorName = cita.doctor.user?.name || 'Doctor';
  const doctorSpeciality = cita.doctor.speciality || 'Especialidad no disponible';
  const clinicAddress = cita.clinicLocation.address || 'Dirección no disponible';

  // Estados
  const isPastAppointment = parseLocal(cita.startTime) < new Date();

  const handleCancelAppointment = async () => {
    Alert.alert(
      "Confirmar Cancelación",
      "¿Estás seguro de que quieres cancelar esta cita?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            setIsCanceling(true);
            setCancelError(null);
            try {
              await cancelAppointment(cita.id);
              Alert.alert("Cita Cancelada", "Tu cita ha sido cancelada con éxito.");
              router.back(); // Volver a la lista de citas
            } catch (error) {
              const errorMessage = error?.message || "No se pudo cancelar la cita.";
              setCancelError(errorMessage);
              Alert.alert("Error", errorMessage);
            } finally {
              setIsCanceling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* El Stack.Screen se ha movido al _layout de mis-citas para un mejor control */}
      {/* Si necesitas un título aquí, asegúrate de que el layout lo permita */}
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
            <Text style={styles.cardSubtitle}>{doctorSpeciality}</Text>
          </View>
          <View style={styles.cardBody}>
            <DetailRow icon="calendar" label="Fecha" value={appointmentDate} />
            <DetailRow icon="clock-o" label="Horario" value={timeRange} />
            <DetailRow icon="map-marker" label="Ubicación" value={clinicAddress} />
            <DetailRow icon="info-circle" label="ID de Cita" value={cita.id} />
          </View>
        </View>

        {cancelError && <Text style={styles.errorText}>{cancelError}</Text>}

        {!isPastAppointment && (
          <View style={{ marginTop: 30 }}>
            <TouchableOpacity
              style={[styles.cancelButton, isCanceling && styles.disabledButton]}
              onPress={handleCancelAppointment}
              disabled={isCanceling}
            >
              {isCanceling
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.cancelButtonText}>Cancelar Cita</Text>}
            </TouchableOpacity>
          </View>
        )}
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
  cancelButton: {
    backgroundColor: '#D9534F', // Un color rojo para indicar una acción destructiva
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#D9534F',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
});