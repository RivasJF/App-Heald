import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { CitaContext } from './+context/CitaContext';

const DOCTORS = [
  {
    id: 'd1',
    name: 'Dr. Juan Pérez',
    specialty: 'Sexologia',
    sex: 'Master del trenzdo',
    photo: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 4.9,
  },
  {
    id: 'd2',
    name: 'Dra. Ana Gómez',
    specialty: 'Dermatología',
    sex: 'Femenino',
    photo: 'https://randomuser.me/api/portraits/women/45.jpg',
    rating: 4.8,
  },
  {
    id: 'd3',
    name: 'Dr. Carlos Ortega',
    specialty: 'Pediatría',
    sex: 'Masculino',
    photo: 'https://randomuser.me/api/portraits/men/76.jpg',
    rating: 4.7,
  },
  {
    id: 'd4',
    name: 'Dra. Sofía Ruiz',
    specialty: 'Ginecología',
    sex: 'Femenino',
    photo: 'https://randomuser.me/api/portraits/women/19.jpg',
    rating: 4.9,
  },
];

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function DoctorScreen() {
  const router = useRouter();
  const { selectedDoctor, setSelectedDoctor, resetCita } = useContext(CitaContext);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    router.push('/(app)/(clientes)/(tabs)/crear-cita/fecha');
  };

  const handleCancel = () => {
    resetCita();
    router.push('/(app)/(clientes)/(tabs)/crear-cita');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: 'Selecciona un doctor', headerShown: true }} />

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Doctores disponibles</Text>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.linkText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {DOCTORS.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            style={[styles.card, selectedDoctor?.id === doctor.id && styles.cardSelected]}
            onPress={() => handleSelectDoctor(doctor)}
            activeOpacity={0.92}
          >
            <View style={styles.initialsWrap}>
              <View style={styles.initialsCircle}>
                <Text style={styles.initialsText}>{getInitials(doctor.name)}</Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{doctor.name}</Text>
              <Text style={styles.cardSubtitle}>{doctor.specialty} · {doctor.sex}</Text>

              <View style={styles.rowBetween}>
                <View style={styles.ratingBox}>
                  <Text style={styles.ratingText}>⭐ {doctor.rating.toFixed(1)}</Text>
                </View>

                <TouchableOpacity onPress={() => handleSelectDoctor(doctor)}>
                  <Text style={styles.selectText}>Ver horarios →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#072B66',
    paddingHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#072B66',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    gap: 12,
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: '#0B4EF2',
    transform: [{ scale: 1.01 }],
  },
  initialsWrap: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  initialsCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EAF1FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7E8FF',
    shadowColor: '#072B66',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  initialsText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B4EF2',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#072B66',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B82B1',
    marginBottom: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBox: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: '#0B4EF2',
    fontWeight: '700',
  },
  selectText: {
    color: '#0B4EF2',
    fontWeight: '700',
  },
});
