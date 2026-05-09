import { FontAwesome } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { findByPatient } from '../../../../../src/services/appointmentService';

const PAGE_SIZE = 5;
const CDMX_TIME_ZONE = 'America/Mexico_City';
 
export default function MisCitas() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode, statusBarStyle } = useTheme();
  const [citas, setCitas] = useState([]);
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
        const responseData = await findByPatient(user.id);
        const appointments = Array.isArray(responseData) ? responseData : [];
        setCitas(appointments);
        setError(null);
      } catch (e) {
        setError('No se pudieron cargar tus citas.');
        console.error('Error fetching appointments:', e);
      } finally {
        setLoading(false);
      }
  }, [user]);

  useFocusEffect(
    // La función se ejecuta cada vez que la pantalla entra en foco
    useCallback(() => {
      fetchCitas();
    }, [fetchCitas])
  );

  // Helper: parsear la fecha de la cita interpretando como local cuando la cadena termina con 'Z'
  const parseLocal = (isoString) => {
    if (!isoString) return new Date(isoString);
    try {
      if (typeof isoString === 'string' && isoString.endsWith('Z')) {
        // UI previously removed the trailing Z to display time as local; mirror that here
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
      return citas.filter(cita => {
        const startLocal = parseLocal(cita.startTime);
        return startLocal >= now;
      });
    }
    return citas.filter(cita => {
      const startLocal = parseLocal(cita.startTime);
      return startLocal < now;
    });
  }, [citas, filter]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredCitas.length / PAGE_SIZE));
  }, [filteredCitas]);

  const paginatedCitas = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCitas.slice(start, start + PAGE_SIZE);
  }, [filteredCitas, page, totalPages]);

  const hasNextPage = page < totalPages;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleFilterChange = useCallback((nextFilter) => {
    setFilter(nextFilter);
    setPage(1);
  }, []);

  const renderItem = ({ item }) => {
    const fecha = new Date(item.startTime).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    const hora = (function() {
      try {
        const s = item.startTime;
        const parsed = (typeof s === 'string' && s.endsWith('Z')) ? new Date(s.slice(0, -1)) : new Date(s);
        return parsed.toLocaleTimeString('es-ES', { weekday: 'short', timeZone: CDMX_TIME_ZONE }).split('.')[0];
      } catch (e) {
        return new Date(item.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
    })();

    // Accedemos al nombre del doctor desde el objeto anidado 'user'
    const doctorName = item.doctor.user?.name || 'Doctor';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push({
          pathname: `/mis-citas/${item.id}`,
          params: { cita: JSON.stringify(item) } // Pasamos el objeto como string
        })}
      >
        <View style={[
          styles.card, 
          { 
            backgroundColor: colors.card, 
            shadowColor: isDarkMode ? '#000' : '#072B66',
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: colors.border
          }]}>
          <View style={[styles.cardHeader, { backgroundColor: isDarkMode ? colors.border : '#EAF1FF' }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>{doctorName}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.subtitle }]}>{item.doctor.speciality}</Text>
          </View>
          <View style={styles.cardBody}>
            <InfoRow icon="calendar" text={`${fecha} a las ${hora} hrs.`} colors={colors} />
            <InfoRow icon="map-marker" text={item.clinicLocation.address} colors={colors} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Mis Citas', headerShown: false }} />
      <StatusBar style={statusBarStyle} />
      <View style={styles.headerContainer}>
        <View style={styles.headerSideSpacer} />
        <Text style={[styles.title, { color: colors.text }]}>Mis Citas</Text>
        <TouchableOpacity onPress={fetchCitas} disabled={loading}>
          <FontAwesome name="refresh" size={24} color={loading ? '#B0C4DE' : colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.filterContainer, { backgroundColor: isDarkMode ? colors.border : '#EAF1FF' }]}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'proximas' && [styles.filterButtonActive, { backgroundColor: colors.card }]]}
          onPress={() => handleFilterChange('proximas')}
        >
          <Text style={[styles.filterText, { color: colors.primary }, filter === 'proximas' && styles.filterTextActive]}>Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pasadas' && [styles.filterButtonActive, { backgroundColor: colors.card }]]}
          onPress={() => handleFilterChange('pasadas')}
        >
          <Text style={[styles.filterText, { color: colors.primary }, filter === 'pasadas' && styles.filterTextActive]}>Pasadas</Text>
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
            onRefresh={fetchCitas} // Permite "pull-to-refresh"
            refreshing={loading}   // Muestra el indicador de carga en pull-to-refresh
            contentContainerStyle={{ paddingTop: 20 }}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.subtitle }]}>Aún no tienes citas agendadas.</Text>}
          />

          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, { backgroundColor: colors.primary }, page === 1 && styles.paginationButtonDisabled]}
              onPress={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
            >
              <Text style={[styles.paginationButtonText, page === 1 && styles.paginationButtonTextDisabled]}>Anterior</Text>
            </TouchableOpacity>

            <Text style={[styles.pageText, { color: colors.text }]}>Página {page}</Text>

            <TouchableOpacity
              style={[styles.paginationButton, { backgroundColor: colors.primary }, !hasNextPage && styles.paginationButtonDisabled]}
              onPress={() => setPage((prev) => prev + 1)}
              disabled={!hasNextPage || loading}
            >
              <Text style={[styles.paginationButtonText, !hasNextPage && styles.paginationButtonTextDisabled]}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, text, colors }) => (
  <View style={styles.infoRow}>
    <FontAwesome name={icon} size={16} color={colors.primary} style={styles.infoIcon} />
    <Text style={[styles.infoText, { color: colors.text }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '800',
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerSideSpacer: {
    width: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 4
  },
  filterText: { fontWeight: '600' },
  filterTextActive: { fontWeight: '800' },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSubtitle: { fontSize: 13, fontWeight: '500' },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 20,
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
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
    fontWeight: '700',
  },
});