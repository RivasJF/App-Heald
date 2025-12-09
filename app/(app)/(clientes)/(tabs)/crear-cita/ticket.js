import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext, useMemo } from 'react';
import { useAuth } from '../../../../../src/context/AuthContext';
import { CitaContext } from './+context/CitaContext';

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function TicketScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedDoctor, selectedDate, selectedTime, resetCita } = useContext(CitaContext);

  const ticketCode = useMemo(() => {
    return `APPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }, []);

  const readableDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const handleFinish = () => {
    resetCita();
    router.push('/(app)/(clientes)/(tabs)/crear-cita');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: 'Ticket', headerShown: true }} />

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
          <View style={styles.initialsWrap}>
            <View style={styles.initialsCircle}>
              <Text style={styles.initialsText}>{getInitials(selectedDoctor?.name)}</Text>
            </View>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.ticketName}>{selectedDoctor?.name}</Text>
            <Text style={styles.ticketSpec}>{selectedDoctor?.specialty}</Text>
            <Text style={styles.ticketMeta}>Fecha: {readableDate}</Text>
            <Text style={styles.ticketMeta}>Hora: {selectedTime}</Text>
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
  initialsWrap: {
    width: 86,
    height: 86,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EAF1FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7E8FF',
  },
  initialsText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B4EF2',
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
