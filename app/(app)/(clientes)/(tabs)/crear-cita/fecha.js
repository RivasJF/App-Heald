import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { getDoctorAvailability } from '../../../../../src/services/appointmentService';
import { CitaContext } from './+context/CitaContext';

const CDMX_TIME_ZONE = 'America/Mexico_City';

export default function FechaScreen() {
  const router = useRouter();
  const { selectedDoctor, selectedDate, setSelectedDate, selectedSlot, setSelectedSlot } = useContext(CitaContext);
  const { colors, isDarkMode, statusBarStyle } = useTheme();

  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Nuevo estado para la carga inicial
  const [errorTimes, setErrorTimes] = useState(null);

  const getDateKeyInCDMX = useCallback((dateValue = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: CDMX_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(dateValue);

    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;

    return `${year}-${month}-${day}`;
  }, []);

  const formatTimeInCDMX = useCallback((isoString) => {
    const dateValue = new Date(isoString);
    return dateValue.toLocaleTimeString('es-MX', {
      timeZone: CDMX_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const dates = useMemo(() => {
    const list = [];
    const cdmxToday = getDateKeyInCDMX(new Date());
    const [baseYear, baseMonth, baseDay] = cdmxToday.split('-').map((value) => Number(value));
    const baseDate = new Date(Date.UTC(baseYear, baseMonth - 1, baseDay, 12));

    for (let i = 0; i < 7; i++) { // Corregido: Mostrar 7 días comenzando desde hoy (i=0)
      const d = new Date(baseDate);
      d.setUTCDate(baseDate.getUTCDate() + i);

      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const dayLabel = d.toLocaleDateString('es-ES', { weekday: 'short', timeZone: CDMX_TIME_ZONE }).split('.')[0];
      const dateNumber = dd;
      list.push({ iso: `${yyyy}-${mm}-${dd}`, label: dayLabel, dateNumber: dateNumber });
    }
    return list;
  }, [getDateKeyInCDMX]);

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
        // Parsear las fechas de los slots para trabajar con objetos Date de forma consistente
        // Además crear una versión local (quitando la 'Z') para que el filtrado use
        // la misma interpretación que la UI (sin cambiar el formato mostrado).
        const parsed = availabilityData.available.map((slot) => ({
          ...slot,
          startDate: new Date(slot.start),
          endDate: slot.end ? new Date(slot.end) : null,
        }));

        // Filtrar horarios que ya pasaron solo si la fecha seleccionada es hoy
        const nowInMillis = Date.now();
        const isToday = getDateKeyInCDMX(new Date()) === date;

        const filteredSlots = parsed.filter((slot) => {
          if (isToday) {
            return slot.startDate.getTime() > nowInMillis;
          }
          return true; // para días futuros incluir todos los horarios
        });

        setTimeSlots(filteredSlots);
      }
    } catch (err) {
      // Si el error de la API tiene un mensaje, lo mostramos.
      const apiMessage = err?.message || 'No se pudo cargar la disponibilidad.';
      setErrorTimes(apiMessage);
      console.error("Error fetching availability:", err);
    } finally {
      setIsLoadingTimes(false);
    }
  }, [selectedDoctor, getDateKeyInCDMX]);

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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Seleccionar fecha y hora', headerShown: false }} />
      <StatusBar style={statusBarStyle} />
      
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.linkText, { color: colors.primary }]}>← Doctores</Text>
        </TouchableOpacity>
        <Text style={[styles.sectionTitleSmall, { color: colors.text }]}>Agenda</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Info del Doctor */}
      <View style={[
        styles.doctorInfoContainer, 
        { 
          backgroundColor: colors.card, 
          shadowColor: isDarkMode ? '#000' : '#072B66',
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: colors.border
        }]}>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={[styles.doctorInfoName, { color: colors.text }]}>{selectedDoctor?.name}</Text>
          <Text style={[styles.doctorInfoSpec, { color: colors.subtitle }]}>{selectedDoctor?.specialty} - {selectedDoctor?.biography}</Text>
          <Text style={[styles.doctorInfoAddress, { color: colors.subtitle }]}>{selectedDoctor?.address}</Text>
          <Text style={[styles.doctorInfoDistance, { color: colors.primary, backgroundColor: isDarkMode ? colors.border : '#EEF4FF' }]}>Aprox. {(selectedDoctor?.distance / 1000).toFixed(1)} km de tu ubicación</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainerDate}>
        {/* Selección de Fecha */}
        <View style={styles.containerSection}>
          <Text style={[styles.label, { color: colors.text }]}>Elige un día disponible</Text>

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
                  style={[styles.dayCard, { backgroundColor: colors.card, borderColor: colors.border }, chosen && { backgroundColor: colors.primary, borderColor: colors.primary, transform: [{ scale: 1.05 }] }]}
                  onPress={() => handleDateSelect(item.iso)}
                >
                  <Text style={[styles.dayLabel, { color: colors.subtitle }, chosen && { color: colors.white }]}>{item.label}</Text>
                  <Text style={[styles.dateNumber, { color: colors.text }, chosen && { color: colors.white }]}>{item.dateNumber}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Selección de Horario */}
        <View style={[styles.containerSection, { marginTop: 20 }]}>
          <Text style={[styles.label, { color: colors.text }]}>Horarios</Text>

          {isLoadingTimes ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : errorTimes ? (
            <Text style={styles.errorText}>{errorTimes}</Text>
          ) : timeSlots.length > 0 ? (
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const displayTime = formatTimeInCDMX(slot.start);
                const chosen = selectedSlot?.start === slot.start;
                return (
                  <TouchableOpacity
                    key={slot.start}
                    style={[styles.timeChip, { backgroundColor: colors.card, borderColor: colors.border }, chosen && { backgroundColor: colors.primary, borderColor: colors.primary, transform: [{ scale: 1.05 }] }]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.timeChipText, { color: colors.text }, chosen && { color: colors.white }]}>{displayTime}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyText}>No hay horarios disponibles para este día.</Text>
          )}

          <View style={{ marginTop: 30 }}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }, !(selectedDate && selectedSlot) && styles.disabledButton]}
              onPress={handleContinue}
              activeOpacity={selectedDate && selectedSlot ? 0.8 : 1}
            >
              <Text style={[styles.primaryButtonText, { color: colors.white }]}>
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
  doctorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  doctorInfoName: { fontSize: 16, fontWeight: '800' },
  doctorInfoSpec: { fontSize: 13, marginTop: 2 },
  doctorInfoAddress: { fontSize: 12, marginTop: 6, marginBottom: 8 },
  doctorInfoDistance: {
    fontSize: 13,
    fontWeight: '700',
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
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 15,
  },
  dayCard: {
    width: 60,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1.5,
  },
  dayLabel: { fontWeight: '600', fontSize: 13, marginBottom: 4 },
  dateNumber: { fontWeight: '800', fontSize: 20 },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  timeChipText: { fontWeight: '700', fontSize: 14 },
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
