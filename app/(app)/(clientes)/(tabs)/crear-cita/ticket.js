import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext, useEffect } from 'react';
import { useAuth } from '../../../../../src/context/AuthContext';
import { CitaContext } from './+context/CitaContext';

export default function TicketScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { resetCita } = useContext(CitaContext); // Solo necesitamos resetCita del contexto
  const params = useLocalSearchParams();
  const { citaCreada: citaString, doctor: doctorString } = params;

  const cita = citaString ? JSON.parse(citaString) : null;
  const doctor = doctorString ? JSON.parse(doctorString) : null;

  // Usamos el ID de la cita creada como el código del ticket
  const ticketCode = cita?.id || 'N/A';

  const readableDate = cita?.startTime
    ? new Date(cita.startTime).toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';
  
  const readableTime = cita?.startTime
    ? new Date(cita.startTime.slice(0, -1)).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  useEffect(() => {
    // Si no se recibió la cita creada, redirigir al inicio del flujo
    if (!cita || !doctor) {
      router.replace('/(app)/(clientes)/(tabs)/crear-cita');
    }
  }, [cita, doctor, router]);

  const handleFinish = () => {
    // El contexto ya se limpió, pero lo llamamos por si acaso el usuario llega aquí por otra vía.
    resetCita(); 
    router.push('/(app)/(clientes)/(tabs)/crear-cita');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: 'Ticket', headerShown: false }} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.linkText}>← Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitleSmall}>Ticket</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={styles.ticketContainer}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle}>ticket</Text>
          <Text style={styles.ticketCode}>{ticketCode}</Text>
        </View>

        <View style={styles.ticketBody}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ticketName}>{doctor?.name}</Text>
            <Text style={styles.ticketSpec}>{doctor?.specialty}</Text>
            <Text style={styles.ticketMeta}>Fecha: {readableDate || 'No disponible'}</Text>
            <Text style={styles.ticketMeta}>Hora: {readableTime || 'No disponible'}</Text>
            <Text style={styles.ticketMeta}>Paciente: {user?.name || 'No disponible'}</Text>
          </View>
        </View>

        <View style={styles.qrMock}>
          <Text style={{ color: '#0B4EF2', fontWeight: '700' }}>--- Código ---</Text>
          <Text style={{ color: '#0B4EF2', marginTop: 6 }}>{ticketCode}</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 18, alignSelf: 'center', width: '80%' }]}
          onPress={handleFinish}
        >
          <Text style={styles.primaryButtonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  headerRow: {
    marginTop: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: '#072B66',
  },
  linkText: {
    color: '#0B4EF2',
    fontWeight: '700',
    padding: 8,
  },
  ticketContainer: {
    padding: 18,
    alignItems: 'center',
  },
  ticketHeader: {
    width: '92%',
    backgroundColor: '#EAF1FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketTitle: {
    color: '#072B66',
    fontWeight: '900',
    fontSize: 20,
  },
  ticketCode: {
    color: '#0B4EF2',
    fontWeight: '800',
    marginTop: 6,
  },
  ticketBody: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#072B66',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 5,
  },
  ticketName: {
    fontWeight: '800',
    color: '#072B66',
    fontSize: 18,
  },
  ticketSpec: {
    color: '#6B82B1',
  },
  ticketMeta: {
    marginTop: 6,
    color: '#24407A',
    fontWeight: '700',
  },
  qrMock: {
    marginTop: 14,
    width: '92%',
    backgroundColor: '#F7FBFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F0FF',
  },
  primaryButton: {
    backgroundColor: '#0B4EF2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0B4EF2',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
