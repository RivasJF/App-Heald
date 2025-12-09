import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { useAuth } from '../../../../../src/context/AuthContext';
import { CitaContext } from './+context/CitaContext';

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function ResumenScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedDoctor, selectedDate, selectedTime } = useContext(CitaContext);

  const readableDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: 'Resumen de la cita', headerShown: true }} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>← Fecha</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitleSmall}>Resumen</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.initialsWrap}>
            <View style={styles.initialsCircle}>
              <Text style={styles.initialsText}>{getInitials(selectedDoctor?.name)}</Text>
            </View>
          </View>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={styles.summaryName}>{selectedDoctor?.name}</Text>
            <Text style={styles.summarySpec}>{selectedDoctor?.specialty}</Text>
            <Text style={styles.summaryMeta}>Sexo: {selectedDoctor?.sex}</Text>
            <Text style={styles.summaryMeta}>Horario: {selectedTime} · {readableDate}</Text>
          </View>
        </View>

        {/* Datos del Paciente */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Datos del Paciente</Text>
          <Text style={styles.infoLine}>Nombre: {user?.name || 'No disponible'}</Text>
        </View>

        <View style={{ width: '100%', marginTop: 10 }}>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 12 }]}
            onPress={() => router.push('/(app)/(clientes)/(tabs)/crear-cita/ticket')}
          >
            <Text style={styles.primaryButtonText}>Confirmar cita</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContainer: {
    padding: 18,
    paddingBottom: 40,
    gap: 12,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#072B66',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0B4EF2',
  },
  summaryName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#072B66',
  },
  summarySpec: {
    color: '#6B82B1',
    marginTop: 4,
    marginBottom: 6,
  },
  summaryMeta: {
    color: '#4B6AA3',
    fontWeight: '700',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#EEF4FF',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  infoTitle: {
    fontWeight: '800',
    color: '#072B66',
    marginBottom: 8,
  },
  infoLine: {
    color: '#24407A',
    marginBottom: 6,
  },
  primaryButton: {
    backgroundColor: '#0B4EF2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: 220,
    alignSelf: 'center',
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
