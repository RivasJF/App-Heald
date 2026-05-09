import { FontAwesome } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { findByDoctor } from '../../../../../src/services/appointmentService';
import { getDoctorByUserId } from '../../../../../src/services/doctorService';

const PAGE_SIZE = 5;
const CDMX_TIME_ZONE = 'America/Mexico_City';

export default function DoctorAppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [allCitas, setAllCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('proximas'); // 'proximas' o 'pasadas'
  const [page, setPage] = useState(1);

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

  // Helper: parsear la fecha interpretando como local cuando la cadena termina con 'Z'
  const parseLocal = (isoString) => {
    if (!isoString) return new Date(isoString);
    try {
      if (typeof isoString === 'string' && isoString.endsWith('Z')) {
        return new Date(isoString.slice(0, -1));
      }
      return new Date(isoString);
    } catch (e) {
      return new Date(isoString);
    }
  };

  const filteredCitas = useMemo(() => {
    const now = new Date();
    if (filter === 'proximas') {
      return allCitas.filter(cita => {
        const startLocal = parseLocal(cita.startTime);
        return startLocal >= now;
      });
    }
    return allCitas.filter(cita => {
      const startLocal = parseLocal(cita.startTime);
      return startLocal < now;
    });
  }, [allCitas, filter]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredCitas.length / PAGE_SIZE));
  }, [filteredCitas]);

  const paginatedCitas = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCitas.slice(start, start + PAGE_SIZE);
  }, [filteredCitas, page, totalPages]);

  const hasNextPage = page < totalPages;

  const handleFilterChange = useCallback((nextFilter) => {
    setFilter(nextFilter);
    setPage(1);
  }, []);

  const renderItem = ({ item }) => {
    const fecha = new Date(item.startTime).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'short'
    });
    const hora = (function() {
      try {
        const s = item.startTime;
        return s.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: CDMX_TIME_ZONE,
    });
      } catch (e) {
        return new Date(item.startTime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: CDMX_TIME_ZONE,
    });
      }
    })();

    // Asumimos que la respuesta incluye un objeto 'patient' con el nombre.
    const patientName = item.patient?.name || 'Paciente no asignado';

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#072B66' }]}
        activeOpacity={0.8}
        onPress={() => router.push({
          pathname: `/(app)/(doctor)/(tabs)/mis-citas/${item.id}`,
          params: { cita: JSON.stringify(item) }
        })}
      >
        <View style={[styles.cardIcon, { backgroundColor: isDarkMode ? colors.border : '#E8EAF6' }]}>
          <FontAwesome name="user-o" size={24} color={colors.primary} />
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{patientName}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.subtitle }]}>{`${fecha} a las ${hora}`}</Text>
        </View>
        <FontAwesome name="angle-right" size={24} color={isDarkMode ? colors.subtitle : "#B0C4DE"} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={[styles.title, { color: colors.text }]}>Mis Citas</Text>

      <View style={[styles.filterContainer, { backgroundColor: isDarkMode ? colors.border : '#E8EAF6' }]}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'proximas' && [styles.filterButtonActive, { backgroundColor: colors.card }]]}
          onPress={() => handleFilterChange('proximas')}
        >
          <Text style={[styles.filterText, { color: colors.primary }, filter === 'proximas' && { fontWeight: '800' }]}>Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pasadas' && [styles.filterButtonActive, { backgroundColor: colors.card }]]}
          onPress={() => handleFilterChange('pasadas')}
        >
          <Text style={[styles.filterText, { color: colors.primary }, filter === 'pasadas' && { fontWeight: '800' }]}>Pasadas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : (
        <View style={styles.listWrapper}>
          <FlatList
            data={paginatedCitas}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 10 }}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.subtitle }]}>No tienes citas en esta categoría.</Text>}
          />

          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, { backgroundColor: colors.primary }, page === 1 && [styles.paginationButtonDisabled, { backgroundColor: isDarkMode ? colors.border : '#B0C4DE' }]]}
              onPress={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
            >
              <Text style={[styles.paginationButtonText, { color: colors.white }, page === 1 && [styles.paginationButtonTextDisabled, { color: isDarkMode ? colors.subtitle : '#EAF1FF' }]]}>Anterior</Text>
            </TouchableOpacity>

            <Text style={[styles.pageText, { color: colors.text }]}>Página {Math.min(page, totalPages)} de {totalPages}</Text>

            <TouchableOpacity
              style={[styles.paginationButton, { backgroundColor: colors.primary }, !hasNextPage && [styles.paginationButtonDisabled, { backgroundColor: isDarkMode ? colors.border : '#B0C4DE' }]]}
              onPress={() => setPage((prev) => prev + 1)}
              disabled={!hasNextPage || loading}
            >
              <Text style={[styles.paginationButtonText, { color: colors.white }, !hasNextPage && [styles.paginationButtonTextDisabled, { color: isDarkMode ? colors.subtitle : '#EAF1FF' }]]}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F8FF' },
  title: { fontSize: 28, fontWeight: '800', color: '#072B66' , textAlign:'center'},
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
  listWrapper: {
    flex: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  paginationButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#3F51B5',
  },
  paginationButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  paginationButtonTextDisabled: {
    color: '#EAF1FF',
  },
  pageText: {
    color: '#3F51B5',
    fontWeight: '700',
  },
});
