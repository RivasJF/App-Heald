import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { CitaContext } from './+context/CitaContext';
import { getDoctorAvailability } from '../../../../../src/services/appointmentService';

export default function FechaScreen() {
  const router = useRouter();
  const { selectedDoctor, selectedDate, setSelectedDate, selectedSlot, setSelectedSlot } = useContext(CitaContext);

  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Nuevo estado para la carga inicial
  const [errorTimes, setErrorTimes] = useState(null);

  const dates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) { // Mostrar solo los próximos 7 días
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dayLabel = d.toLocaleDateString('es-ES', { weekday: 'short' }).split('.')[0];
      const dateNumber = String(d.getDate());
      list.push({ iso: `${yyyy}-${mm}-${dd}`, label: dayLabel, dateNumber: dateNumber });
    }
    return list;
  }, []);

  const fetchAvailability = useCallback(async (date) => {
    if (!selectedDoctor?.id) return;
    setIsLoadingTimes(true);
    setErrorTimes(null);
    setTimeSlots([]);
    try {
      const availabilityData = await getDoctorAvailability(selectedDoctor.id, date);
      // Si la API devuelve un mensaje específico y no hay horarios, lo mostramos.
      if (availabilityData.message && availabilityData.available.length === 0) {
        setErrorTimes(availabilityData.message);
        setTimeSlots([]);
      } else {
        setTimeSlots(availabilityData.available); // Guardamos el array de objetos {start, end}
      }
    } catch (err) {
      // Si el error de la API tiene un mensaje, lo mostramos.
      const apiMessage = err?.message || 'No se pudo cargar la disponibilidad.';
      setErrorTimes(apiMessage);
      console.error("Error fetching availability:", err);
    } finally {
      setIsLoadingTimes(false);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    // Este efecto se encarga de cargar la disponibilidad cuando la pantalla se monta
    // o cuando el doctor seleccionado cambia.
    if (dates.length > 0) {
      const defaultDate = dates[0].iso;
      setSelectedDate(defaultDate);
      fetchAvailability(defaultDate);
    }
  }, [selectedDoctor, dates, fetchAvailability]); // Depende del doctor y la lista de fechas

  const handleDateSelect = (dateISO) => {
    if (selectedDate === dateISO) return; // No recargar si la fecha es la misma

    setSelectedDate(dateISO);
    setSelectedSlot(null);
    fetchAvailability(dateISO);
  };

  const handleContinue = () => {
    if (selectedDate && selectedSlot) {
      router.push('/(app)/(clientes)/(tabs)/crear-cita/resumen');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: 'Seleccionar fecha y hora', headerShown: true }} />
      
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>← Doctores</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitleSmall}>Agenda</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Info del Doctor */}
      <View style={styles.doctorInfoContainer}>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.doctorInfoName}>{selectedDoctor?.name}</Text>
          <Text style={styles.doctorInfoSpec}>{selectedDoctor?.specialty} - {selectedDoctor?.biography}</Text>
          <Text style={styles.doctorInfoAddress}>{selectedDoctor?.address}</Text>
          <Text style={styles.doctorInfoDistance}>Aprox. {(selectedDoctor?.distance / 1000).toFixed(1)} km de tu ubicación</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainerDate}>
        {/* Selección de Fecha */}
        <View style={styles.containerSection}>
          <Text style={styles.label}>Elige un día disponible</Text>

          <FlatList
            horizontal
            data={dates}
            keyExtractor={(i) => i.iso}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 18 }}
            renderItem={({ item }) => {
              const chosen = selectedDate === item.iso;
              return (
                <TouchableOpacity
                  style={[styles.dayCard, chosen && styles.dayCardActive]}
                  onPress={() => handleDateSelect(item.iso)}
                >
                  <Text style={[styles.dayLabel, chosen && styles.dayLabelActive]}>{item.label}</Text>
                  <Text style={[styles.dateNumber, chosen && styles.dateNumberActive]}>{item.dateNumber}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Selección de Horario */}
        <View style={[styles.containerSection, { marginTop: 20 }]}>
          <Text style={styles.label}>Horarios</Text>

          {isLoadingTimes ? (
            <ActivityIndicator size="large" color="#0B4EF2" style={{ marginTop: 20 }} />
          ) : errorTimes ? (
            <Text style={styles.errorText}>{errorTimes}</Text>
          ) : timeSlots.length > 0 ? (
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const displayTime = new Date(slot.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const chosen = selectedSlot?.start === slot.start;
                return (
                  <TouchableOpacity
                    key={slot.start}
                    style={[styles.timeChip, chosen && styles.timeChipActive]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.timeChipText, chosen && styles.timeChipTextActive]}>{displayTime}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyText}>No hay horarios disponibles para este día.</Text>
          )}

          <View style={{ marginTop: 30 }}>
            <TouchableOpacity
              style={[styles.primaryButton, !(selectedDate && selectedSlot) && styles.disabledButton]}
              onPress={handleContinue}
              activeOpacity={selectedDate && selectedSlot ? 0.8 : 1}
            >
              <Text style={styles.primaryButtonText}>
                {selectedDate && selectedSlot ? 'Continuar' : 'Selecciona fecha y hora'}
              </Text>
            </TouchableOpacity>
          </View>
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
  doctorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#072B66',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  doctorInfoName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#072B66',
  },
  doctorInfoSpec: {
    fontSize: 13,
    color: '#6B82B1',
    marginTop: 2,
  },
  doctorInfoAddress: {
    fontSize: 12,
    color: '#36548B',
    marginTop: 6,
    marginBottom: 8,
  },
  doctorInfoDistance: {
    fontSize: 13,
    color: '#0B4EF2',
    fontWeight: '700',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  scrollContainerDate: {
    paddingBottom: 40,
  },
  containerSection: {
    paddingHorizontal: 18,
  },
  label: {
    color: '#36548B',
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 15,
  },
  dayCard: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: 60,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#072B66',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#EAF1FF',
  },
  dayCardActive: {
    backgroundColor: '#0B4EF2',
    borderColor: '#0B4EF2',
    transform: [{ scale: 1.05 }],
  },
  dayLabel: {
    color: '#6B82B1',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 4,
  },
  dayLabelActive: {
    color: '#EAF1FF',
  },
  dateNumber: {
    color: '#072B66',
    fontWeight: '800',
    fontSize: 20,
  },
  dateNumberActive: {
    color: '#fff',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EAF1FF',
    shadowColor: '#072B66',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  timeChipActive: {
    backgroundColor: '#0B4EF2',
    borderColor: '#0B4EF2',
    transform: [{ scale: 1.05 }],
  },
  timeChipText: {
    color: '#223762',
    fontWeight: '700',
    fontSize: 14,
  },
  timeChipTextActive: {
    color: '#fff',
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
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    textAlign: 'center',
    color: '#D9534F',
    marginTop: 20,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B82B1',
    marginTop: 20,
    fontSize: 16,
  },
});
