import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SectionList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext, useEffect, useState } from 'react';
import { CitaContext } from './+context/CitaContext';
import { getNearbyClinicsPagination } from '../../../../../src/services/clinicService';

const PAGE_SIZE = 10;

export default function DoctorScreen() {
  const router = useRouter();
  const { selectedDoctor, setSelectedDoctor, resetCita, selectedLocation } = useContext(CitaContext);
  
  const [activeDoctors, setActiveDoctors] = useState([]);
  const [inactiveDoctors, setInactiveDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [selectedLocation]);

  useEffect(() => {
    if (!selectedLocation) {
      setError('No se ha seleccionado una ubicación.');
      setIsLoading(false);
      // Opcional: redirigir si no hay ubicación
      // router.replace('/(app)/(clientes)/(tabs)/crear-cita');
      return;
    }

    const fetchNearbyDoctors = async () => {
      try {
        setIsLoading(true);
        const responseData = await getNearbyClinicsPagination({
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
          radius: 10000, // 10km
        }, page, PAGE_SIZE);

        const nearbyClinics = Array.isArray(responseData)
          ? responseData
          : (responseData?.data || responseData?.items || []);

        const active = [];
        const inactive = [];

        nearbyClinics.forEach(clinic => {
          if (!clinic.doctor || !clinic.doctor.user) return;

          const doctorData = {
            id: clinic.doctor.id,
            name: clinic.doctor.user.name,
            specialty: clinic.doctor.speciality,
            biography: clinic.doctor.biography,
            address: clinic.address,
            clinicLocationId: clinic.id, // Añadimos el ID de la ubicación de la clínica
            distance: clinic.distance,
            rating: 4.5, // Placeholder, ya que no viene en la API
            active: clinic.doctor.serviceStatus?.active || false,
          };

          if (doctorData.active) {
            active.push(doctorData);
          } else {
            inactive.push(doctorData);
          }
        });

        setActiveDoctors(active);
        setInactiveDoctors(inactive);
        setHasNextPage(
          typeof responseData?.hasNextPage === 'boolean'
            ? responseData.hasNextPage
            : nearbyClinics.length === PAGE_SIZE
        );
        setError(null);
      } catch (e) {
        console.error('Error fetching nearby doctors:', e);
        setError('No se pudieron encontrar doctores cercanos.');
        setHasNextPage(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbyDoctors();
  }, [selectedLocation, page]);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    router.push('/(app)/(clientes)/(tabs)/crear-cita/fecha');
  };

  const handleCancel = () => {
    resetCita();
    router.push('/(app)/(clientes)/(tabs)/crear-cita');
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const renderDoctorCard = ({ item: doctor }) => (
    <TouchableOpacity
      key={doctor.id}
      style={[styles.card, selectedDoctor?.id === doctor.id && styles.cardSelected]}
      onPress={() => handleSelectDoctor(doctor)}
      activeOpacity={0.92}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{doctor.name}</Text>
        <Text style={styles.cardSubtitle}>{doctor.specialty} - {doctor.biography}</Text>
        <Text style={styles.addressText}>{doctor.address}</Text>
        
        <View style={styles.rowBetween}>
          <Text style={styles.distanceText}>{(doctor.distance / 1000).toFixed(1)} km de distancia</Text>

          <TouchableOpacity disabled={!doctor.active} onPress={() => handleSelectDoctor(doctor)}>
            <Text style={styles.selectText}>Ver horarios →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const sections = [
    { title: 'Doctores Disponibles', data: activeDoctors },
    { title: 'Doctores No Disponibles', data: inactiveDoctors },
  ].filter(section => section.data.length > 0);

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#0B4EF2" style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    return (
      <View style={styles.listWrapper}>
        <SectionList
          sections={sections}
          renderItem={renderDoctorCard}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron doctores en esta área.</Text>}
        />

        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
            onPress={handlePrevPage}
            disabled={page === 1 || isLoading}
          >
            <Text style={[styles.paginationButtonText, page === 1 && styles.paginationButtonTextDisabled]}>Anterior</Text>
          </TouchableOpacity>

          <Text style={styles.pageText}>Página {page}</Text>

          <TouchableOpacity
            style={[styles.paginationButton, !hasNextPage && styles.paginationButtonDisabled]}
            onPress={handleNextPage}
            disabled={!hasNextPage || isLoading}
          >
            <Text style={[styles.paginationButtonText, !hasNextPage && styles.paginationButtonTextDisabled]}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: 'Selecciona un doctor', headerShown: false }} />

      <View style={[styles.headerRow, { marginBottom: 10 }]}>
        <Text style={styles.sectionTitle}>Doctores disponibles</Text>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.linkText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
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
  },
  linkText: {
    color: '#0B4EF2',
    fontWeight: '700',
    padding: 8,
  },
  listContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  listWrapper: {
    flex: 1,
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
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: '#0B4EF2',
    transform: [{ scale: 1.01 }],
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
    marginBottom: 8,
  },
  addressText: {
    fontSize: 12,
    color: '#36548B',
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  distanceText: {
    fontSize: 13,
    color: '#0B4EF2',
    fontWeight: '700',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectText: {
    color: '#0B4EF2',
    fontWeight: '700',
  },
  errorText: {
    textAlign: 'center',
    color: '#D9534F',
    marginTop: 50,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B82B1',
    marginTop: 50,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#36548B',
    backgroundColor: '#F5F8FF',
    paddingTop: 16,
    paddingBottom: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 10,
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
