import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext, useMemo } from 'react';
import { CitaContext } from './+context/CitaContext';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '11:00', '13:00', '14:30', '16:00', '17:30'];

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function FechaScreen() {
  const router = useRouter();
  const { selectedDoctor, selectedDate, setSelectedDate, selectedTime, setSelectedTime } = useContext(CitaContext);

  const dates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
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

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
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
        <View style={styles.initialsWrap}>
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{getInitials(selectedDoctor?.name)}</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.doctorInfoName}>{selectedDoctor?.name}</Text>
          <Text style={styles.doctorInfoSpec}>{selectedDoctor?.specialty}</Text>
          <Text style={styles.doctorInfoRating}>⭐ {selectedDoctor?.rating.toFixed(1)}</Text>
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
                  onPress={() => {
                    setSelectedDate(item.iso);
                    setSelectedTime(null);
                  }}
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

          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((t) => {
              const chosen = t === selectedTime;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, chosen && styles.timeChipActive]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={[styles.timeChipText, chosen && styles.timeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ marginTop: 30 }}>
            <TouchableOpacity
              style={[styles.primaryButton, !(selectedDate && selectedTime) && styles.disabledButton]}
              onPress={handleContinue}
              activeOpacity={selectedDate && selectedTime ? 0.8 : 1}
            >
              <Text style={styles.primaryButtonText}>
                {selectedDate && selectedTime ? 'Continuar' : 'Selecciona fecha y hora'}
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
  initialsWrap: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  initialsCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAF1FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7E8FF',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B4EF2',
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
  doctorInfoRating: {
    fontSize: 13,
    color: '#0B4EF2',
    fontWeight: '700',
    marginTop: 4,
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
});
