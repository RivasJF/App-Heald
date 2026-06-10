import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { createAppointment } from '../../../../../src/services/appointmentService';
import { CitaContext } from './+context/CitaContext';

export default function ResumenScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode, statusBarStyle } = useTheme();
  const { selectedDoctor, selectedDate, selectedSlot, selectedLocation, resetCita } = useContext(CitaContext);

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);

  const readableDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  
  const displayTime = selectedSlot?.start 
    ? new Date(selectedSlot.start).toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }) 
    : '';

  const handleConfirmarCita = async () => {
    if (!selectedDoctor || !selectedSlot || !user?.id || !selectedDoctor.clinicLocationId) {
      setConfirmError('Faltan datos esenciales para confirmar la cita.');
      return;
    }

    setIsConfirming(true);
    setConfirmError(null);

    try {
      const dto = {
        doctorId: selectedDoctor.id,
        patientId: user.id,
        clinicLocationId: selectedDoctor.clinicLocationId,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
      };

      const nuevaCita = await createAppointment(dto);
      
      // Pasamos la cita recién creada y los datos del doctor a la pantalla del ticket
      router.replace({
        pathname: '/(app)/(clientes)/(tabs)/crear-cita/ticket',
        params: { citaCreada: JSON.stringify(nuevaCita), doctor: JSON.stringify(selectedDoctor) }
      });
      // Limpiamos el contexto inmediatamente después de completar el flujo.
      resetCita();
    } catch (error) {
      console.error('Error al confirmar la cita:', error);
      const errorMessage = error?.message || 'Hubo un error al confirmar tu cita. Inténtalo de nuevo.';
      setConfirmError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Resumen de la cita', headerShown: false }} />
      <StatusBar style={statusBarStyle} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.linkText, { color: colors.primary }]}>← Fecha</Text>
        </TouchableOpacity>
        <Text style={[styles.sectionTitleSmall, { color: colors.text }]}>Resumen</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {confirmError && <Text style={[styles.errorText, { color: colors.error }]}>{confirmError}</Text>}

        <View style={[
          styles.summaryCard, 
          { 
            backgroundColor: colors.card, 
            shadowColor: isDarkMode ? '#000' : '#072B66',
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: colors.border
          }]}>
          <View style={styles.summaryDoctorInfo}>
            <Text style={[styles.summaryName, { color: colors.text }]}>{selectedDoctor?.name || 'Doctor no seleccionado'}</Text>
            <Text style={[styles.summarySpec, { color: colors.subtitle }]}>{selectedDoctor?.specialty || 'Especialidad no disponible'}</Text>
            {selectedDoctor?.biography && <Text style={[styles.summaryMeta, { color: colors.subtitle }]}>{selectedDoctor.biography}</Text>}
            {selectedDoctor?.address && (
              <View style={styles.summaryDetailRow}>
                <FontAwesome name="map-marker" size={16} color={colors.primary} style={styles.summaryDetailIcon} />
                <Text style={[styles.summaryMeta, { color: colors.text }]}>{selectedDoctor.address}</Text>
              </View>
            )}
            {selectedDoctor?.distance && (
              <View style={styles.summaryDetailRow}>
                <FontAwesome name="road" size={16} color={colors.primary} style={styles.summaryDetailIcon} />
                <Text style={[styles.summaryMeta, { color: colors.text }]}>Aprox. {(selectedDoctor.distance / 1000).toFixed(1)} km</Text>
              </View>
            )}
            <View style={styles.summaryDetailRow}>
              <FontAwesome name="clock-o" size={16} color={colors.primary} style={styles.summaryDetailIcon} />
              <Text style={[styles.summaryMeta, { color: colors.text }]}>Horario: {displayTime} · {readableDate}</Text>
            </View>
          </View>
        </View>

        {/* Datos del Paciente */}
        <View style={[styles.infoBox, { backgroundColor: isDarkMode ? colors.card : '#EEF4FF', borderWidth: isDarkMode ? 1 : 0, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.primary }]}>Datos del Paciente</Text>
          <Text style={[styles.infoLine, { color: colors.text }]}>Nombre: {user?.name || 'No disponible'}</Text>
          {user?.email && <Text style={[styles.infoLine, { color: colors.text }]}>Email: {user.email}</Text>}
          {user?.phoneNumber && <Text style={[styles.infoLine, { color: colors.text }]}>Teléfono: {user.phoneNumber}</Text>}
        </View>

        {/* Ubicación Seleccionada por el Usuario */}
        {selectedLocation?.address && (
          <View style={[styles.infoBox, { backgroundColor: isDarkMode ? colors.card : '#EEF4FF', borderWidth: isDarkMode ? 1 : 0, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.primary }]}>Tu Ubicación Seleccionada</Text>
            <Text style={[styles.infoLine, { color: colors.text }]}>Dirección: {selectedLocation.address}</Text>
          </View>
        )}

        <View style={{ width: '100%', marginTop: 10 }}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 12 }, isConfirming && styles.disabledButton]}
            onPress={handleConfirmarCita} // El botón ya estaba conectado correctamente
            disabled={isConfirming}
          >
            {isConfirming ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.white }]}>Confirmar cita</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContainer: {
    padding: 18,
    paddingBottom: 40,
    gap: 12,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryDoctorInfo: {
    flex: 1,
    paddingLeft: 0, // Ajustado para que no haya margen inicial
  },
  summaryName: {
    fontSize: 18,
    fontWeight: '800',
  },
  summarySpec: {
    marginTop: 4,
    marginBottom: 6,
  },
  summaryMeta: {
    fontWeight: '600',
    marginTop: 4,
  },
  summaryDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryDetailIcon: {
    marginRight: 10,
  },
  infoBox: {
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  infoTitle: {
    fontWeight: '800',
    marginBottom: 8,
  },
  infoLine: {
    marginBottom: 6,
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: 220,
    alignSelf: 'center',
    alignItems: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 15,
  },
});
