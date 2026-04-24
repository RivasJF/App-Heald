import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../../src/context/AuthContext';
import { findByPatientPagination } from '../../../../../src/services/appointmentService';
import { FontAwesome } from '@expo/vector-icons';

const PAGE_SIZE = 5;
 
export default function MisCitas() {
  const router = useRouter();
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('proximas'); // 'proximas' o 'pasadas'
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchCitas = useCallback(async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const responseData = await findByPatientPagination(user.id, page, PAGE_SIZE);
        const appointments = Array.isArray(responseData)
          ? responseData
          : (responseData?.data || responseData?.items || []);

        setCitas(appointments);
        setHasNextPage(
          typeof responseData?.hasNextPage === 'boolean'
            ? responseData.hasNextPage
            : appointments.length === PAGE_SIZE
        );
        setError(null);
      } catch (e) {
        setError('No se pudieron cargar tus citas.');
        setHasNextPage(false);
        console.error('Error fetching appointments:', e);
      } finally {
        setLoading(false);
      }
  }, [user, page]);

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
        return parsed.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
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
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{doctorName}</Text>
            <Text style={styles.cardSubtitle}>{item.doctor.speciality}</Text>
          </View>
          <View style={styles.cardBody}>
            <InfoRow icon="calendar" text={`${fecha} a las ${hora} hrs.`} />
            <InfoRow icon="map-marker" text={item.clinicLocation.address} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Mis Citas' }} />
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Mis Citas Creadas</Text>
        <TouchableOpacity onPress={fetchCitas} disabled={loading}>
          <FontAwesome name="refresh" size={24} color={loading ? '#B0C4DE' : '#0B4EF2'} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'proximas' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('proximas')}
        >
          <Text style={[styles.filterText, filter === 'proximas' && styles.filterTextActive]}>Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pasadas' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('pasadas')}
        >
          <Text style={[styles.filterText, filter === 'pasadas' && styles.filterTextActive]}>Pasadas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0B4EF2" style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.listWrapper}>
          <FlatList
            data={filteredCitas}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            onRefresh={fetchCitas} // Permite "pull-to-refresh"
            refreshing={loading}   // Muestra el indicador de carga en pull-to-refresh
            contentContainerStyle={{ paddingTop: 20 }}
            ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes citas agendadas.</Text>}
          />

          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
              onPress={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
            >
              <Text style={[styles.paginationButtonText, page === 1 && styles.paginationButtonTextDisabled]}>Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.pageText}>Página {page}</Text>

            <TouchableOpacity
              style={[styles.paginationButton, !hasNextPage && styles.paginationButtonDisabled]}
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

const InfoRow = ({ icon, text }) => (
  <View style={styles.infoRow}>
    <FontAwesome name={icon} size={16} color="#4B6AA3" style={styles.infoIcon} />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F8FF' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#072B66',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAF1FF',
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
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4
  },
  filterText: { color: '#0B4EF2', fontWeight: '600' },
  filterTextActive: { color: '#0B4EF2', fontWeight: '800' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#EAF1FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B4EF2',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#36548B',
  },
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
    color: '#36548B',
    lineHeight: 20,
  },
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
    backgroundColor: '#0B4EF2',
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
    color: '#36548B',
    fontWeight: '700',
  },
});