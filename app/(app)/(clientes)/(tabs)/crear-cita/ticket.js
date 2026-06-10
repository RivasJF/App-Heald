import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { CitaContext } from './+context/CitaContext';

export default function TicketScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode, statusBarStyle } = useTheme();
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
    ? new Date(cita.startTime).toLocaleTimeString('es-MX', {
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Ticket', headerShown: false }} />
      <StatusBar style={statusBarStyle} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={[styles.linkText, { color: colors.primary }]}>← Inicio</Text>
        </TouchableOpacity>
        <Text style={[styles.sectionTitleSmall, { color: colors.text }]}>Ticket</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={styles.ticketContainer}>
        <View style={[styles.ticketHeader, { backgroundColor: isDarkMode ? colors.border : '#EAF1FF' }]}>
          <Text style={[styles.ticketTitle, { color: colors.text }]}>ticket</Text>
          <Text style={[styles.ticketCode, { color: colors.primary }]}>{ticketCode}</Text>
        </View>

        <View style={[
          styles.ticketBody, 
          { 
            backgroundColor: colors.card, 
            shadowColor: isDarkMode ? '#000' : '#072B66',
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: colors.border
          }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.ticketName, { color: colors.text }]}>{doctor?.name}</Text>
            <Text style={[styles.ticketSpec, { color: colors.subtitle }]}>{doctor?.specialty}</Text>
            <Text style={[styles.ticketMeta, { color: colors.text }]}>Fecha: {readableDate || 'No disponible'}</Text>
            <Text style={[styles.ticketMeta, { color: colors.text }]}>Hora: {readableTime || 'No disponible'}</Text>
            <Text style={[styles.ticketMeta, { color: colors.text }]}>Paciente: {user?.name || 'No disponible'}</Text>
          </View>
        </View>

        <View style={[styles.qrMock, { backgroundColor: isDarkMode ? colors.background : '#F7FBFF', borderColor: colors.border }]}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>--- Código ---</Text>
          <Text style={{ color: colors.primary, marginTop: 6 }}>{ticketCode}</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 18, alignSelf: 'center', width: '80%' }]}
          onPress={handleFinish}
        >
          <Text style={[styles.primaryButtonText, { color: colors.white }]}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
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
  },
  linkText: {
    fontWeight: '700',
    padding: 8,
  },
  ticketContainer: {
    padding: 18,
    alignItems: 'center',
  },
  ticketHeader: {
    width: '92%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketTitle: {
    fontWeight: '900',
    fontSize: 20,
  },
  ticketCode: {
    fontWeight: '800',
    marginTop: 6,
  },
  ticketBody: {
    width: '92%',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 5,
  },
  ticketName: {
    fontWeight: '800',
    fontSize: 18,
  },
  ticketSpec: {
  },
  ticketMeta: {
    marginTop: 6,
    fontWeight: '700',
  },
  qrMock: {
    marginTop: 14,
    width: '92%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
