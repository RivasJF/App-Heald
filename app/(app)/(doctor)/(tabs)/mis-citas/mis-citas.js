import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../../src/context/AuthContext';
import { findByDoctor } from '../../../../../src/services/appointmentService';
import { getDoctorByUserId } from '../../../../../src/services/doctorService';
import { FontAwesome } from '@expo/vector-icons';

export default function DoctorAppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [allCitas, setAllCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('proximas'); // 'proximas' o 'pasadas'

  const fetchCitas = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 1. Obtener el perfil del doctor usando el ID de usuario
      const doctorProfile = await getDoctorByUserId(user.id);
      if (!doctorProfile?.id) {
        setError('No se pudo encontrar el perfil del doctor.');
        setLoading(false);
        return;
      }
      // 2. Usar el ID del perfil del doctor para obtener las citas
      const doctorId = doctorProfile.id;
      const data = await findByDoctor(doctorId);
      setAllCitas(data);
      setError(null);
    } catch (e) {
      setError('No se pudieron cargar las citas.');
      console.error('Error fetching doctor appointments:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchCitas();
    }, [fetchCitas])
  );

  const filteredCitas = useMemo(() => {
    const now = new Date();
    if (filter === 'proximas') {
      return allCitas.filter(cita => new Date(cita.startTime) >= now);
    }
    return allCitas.filter(cita => new Date(cita.startTime) < now);
  }, [allCitas, filter]);

  const renderItem = ({ item }) => {
    const fecha = new Date(item.startTime).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'short'
    });
    const hora = new Date(item.startTime.slice(0, -1)).toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

    // Asumimos que la respuesta incluye un objeto 'patient' con el nombre.
    const patientName = item.patient?.name || 'Paciente no asignado';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push({
          pathname: `/(app)/(doctor)/(tabs)/mis-citas/${item.id}`,
          params: { cita: JSON.stringify(item) }
        })}
      >
        <View style={styles.cardIcon}>
          <FontAwesome name="user-o" size={24} color="#3F51B5" />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{patientName}</Text>
          <Text style={styles.cardSubtitle}>{`${fecha} a las ${hora}`}</Text>
        </View>
        <FontAwesome name="angle-right" size={24} color="#B0C4DE" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Mis Citas</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'proximas' && styles.filterButtonActive]}
          onPress={() => setFilter('proximas')}
        >
          <Text style={[styles.filterText, filter === 'proximas' && styles.filterTextActive]}>Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pasadas' && styles.filterButtonActive]}
          onPress={() => setFilter('pasadas')}
        >
          <Text style={[styles.filterText, filter === 'pasadas' && styles.filterTextActive]}>Pasadas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3F51B5" style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredCitas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 10 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No tienes citas en esta categoría.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F8FF' },
  title: { fontSize: 28, fontWeight: '800', color: '#072B66' },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8EAF6',
    borderRadius: 10,
    padding: 4,
    marginVertical: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  filterText: { color: '#3F51B5', fontWeight: '600' },
  filterTextActive: { color: '#3F51B5', fontWeight: '800' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#072B66' },
  cardSubtitle: { fontSize: 14, color: '#6B82B1', marginTop: 2 },
  errorText: {
    textAlign: 'center',
    color: '#D9534F',
    marginTop: 30,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B82B1',
    marginTop: 30,
    fontSize: 16,
  },
});
