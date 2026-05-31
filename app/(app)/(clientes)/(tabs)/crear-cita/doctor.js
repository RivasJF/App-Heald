import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { getNearbyClinicsPagination } from '../../../../../src/services/clinicService';
import { CitaContext } from './+context/CitaContext';

const PAGE_SIZE = 20;
const SNAP_VALUES = [1, 5, 10, 20];

export default function DoctorScreen() {
  const router = useRouter();
  const { colors, isDarkMode, statusBarStyle } = useTheme();
  const { selectedDoctor, setSelectedDoctor, resetCita, selectedLocation } = useContext(CitaContext);
  
  const [activeDoctors, setActiveDoctors] = useState([]);
  const [inactiveDoctors, setInactiveDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Estados para Búsqueda y Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [distanceRange, setDistanceRange] = useState(10); // Rango en KM
  const [tempDistanceRange, setTempDistanceRange] = useState(10);
  const [sliderWidth, setSliderWidth] = useState(0);

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
          radius: distanceRange * 1000, // Convertimos KM a metros para la API
        }, page, PAGE_SIZE);

        let nearbyClinics = Array.isArray(responseData)
          ? responseData
          : (responseData?.data || responseData?.items || []);

        // Filtrado local por búsqueda de texto
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          nearbyClinics = nearbyClinics.filter(clinic => {
            const specialty = (clinic.doctor?.speciality || "").toLowerCase();
            const doctorName = (clinic.doctor?.user?.name || "").toLowerCase();
            const clinicName = (clinic.address || "").toLowerCase(); // Usamos dirección como proxy de nombre de clínica si no hay campo name
            
            return specialty.includes(query) || doctorName.includes(query) || clinicName.includes(query);
          });
        }

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
  }, [selectedLocation, page, distanceRange, searchQuery]);

  const handleSliderTouch = useCallback((evt) => {
    const x = evt.nativeEvent.locationX;
    if (sliderWidth > 0) {
      const ratio = Math.max(0, Math.min(1, x / sliderWidth));
      const index = Math.round(ratio * (SNAP_VALUES.length - 1));
      setTempDistanceRange(SNAP_VALUES[index]);
    }
  }, [sliderWidth]);

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
      style={[
        styles.card, 
        { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#072B66', borderWidth: isDarkMode ? 1 : 0, borderColor: colors.border },
        selectedDoctor?.id === doctor.id && { borderColor: colors.primary, borderWidth: 2 }
      ]}
      onPress={() => handleSelectDoctor(doctor)}
      activeOpacity={0.92}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{doctor.name}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.subtitle }]}>{doctor.specialty} - {doctor.biography}</Text>
        <Text style={[styles.addressText, { color: colors.subtitle }]}>{doctor.address}</Text>
        
        <View style={styles.rowBetween}>
          <View style={[styles.distanceBadge, { backgroundColor: isDarkMode ? colors.border : '#EEF4FF' }]}>
            <Text style={[styles.distanceText, { color: colors.primary }]}>{(doctor.distance / 1000).toFixed(1)} km</Text>
          </View>

          <TouchableOpacity disabled={!doctor.active} onPress={() => handleSelectDoctor(doctor)}>
            <Text style={[styles.selectText, { color: colors.primary }]}>Ver horarios →</Text>
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
      return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>;
    }
    return (
      <View style={styles.listWrapper}>
        <SectionList
          sections={sections}
          renderItem={renderDoctorCard}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[styles.sectionHeader, { color: colors.subtitle, backgroundColor: colors.background }]}>{title}</Text>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.subtitle }]}>No se encontraron doctores en esta área.</Text>}
        />

        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationButton, { backgroundColor: colors.primary }, page === 1 && styles.paginationButtonDisabled]}
            onPress={handlePrevPage}
            disabled={page === 1 || isLoading}
          >
            <Text style={[styles.paginationButtonText, { color: colors.white }]}>Anterior</Text>
          </TouchableOpacity>

          <Text style={[styles.pageText, { color: colors.text }]}>Página {page}</Text>

          <TouchableOpacity
            style={[styles.paginationButton, { backgroundColor: colors.primary }, !hasNextPage && styles.paginationButtonDisabled]}
            onPress={handleNextPage}
            disabled={!hasNextPage || isLoading}
          >
            <Text style={[styles.paginationButtonText, { color: colors.white }]}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Selecciona un doctor', headerShown: false }} />
      <StatusBar style={statusBarStyle} />

      <View style={[styles.headerRow, { marginTop: 15, marginBottom: 5 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Doctores disponibles</Text>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* 1. Barra de Búsqueda Superior */}
      <View style={styles.searchBarContainer}>
        <View style={[styles.searchBar, { 
            backgroundColor: isDarkMode ? 'rgba(26, 34, 53, 0.96)' : 'rgba(255, 255, 255, 0.96)',
            borderColor: isDarkMode ? 'rgba(75, 163, 227, 0.3)' : 'rgba(0, 0, 0, 0.1)'
        }]}>
          <Ionicons name="search" size={20} color={isDarkMode ? "#6B82B1" : "#888"} style={{ marginLeft: 15 }} />
          <TextInput 
            placeholder="Buscar especialidad, doctor o clínica"
            placeholderTextColor={isDarkMode ? "#6B82B1" : "#999"}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={[styles.filterIconButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setTempDistanceRange(distanceRange);
              setShowFilters(true);
            }}
          >
            <Ionicons name="options-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {renderContent()}

      {/* 2. Modal de Filtros Simplificado */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowFilters(false)} />
          <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            
            <Text style={[styles.sheetSectionTitle, { color: colors.text }]}>Rango de Distancia</Text>
            <View style={styles.sliderContainer}>
              {(() => {
                const percentage = (SNAP_VALUES.indexOf(tempDistanceRange) / (SNAP_VALUES.length - 1)) * 100;
                return (
                  <View 
                    style={[styles.sliderTrack, { backgroundColor: isDarkMode ? '#121826' : '#F0F0F0' }]}
                    onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={handleSliderTouch}
                    onResponderMove={handleSliderTouch}
                  >
                    <View pointerEvents="none" style={[styles.sliderFill, { backgroundColor: colors.primary, width: `${percentage}%` }]} />
                    <View pointerEvents="none" style={[styles.sliderThumb, { borderColor: colors.primary, left: `${percentage}%` }]} />
                  </View>
                );
              })()}
              <View style={styles.sliderLabels}>
                {SNAP_VALUES.map((val) => (
                  <Text key={val} style={styles.sliderLabelText}>{val === 20 ? '+20' : val}km</Text>
                ))}
              </View>
              <Text style={[styles.dynamicDistanceText, { color: colors.primary }]}>A menos de {tempDistanceRange} km a la redonda</Text>
            </View>

            <TouchableOpacity 
              style={[styles.applyFiltersButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setDistanceRange(tempDistanceRange);
                setShowFilters(false);
              }}
            >
              <Text style={styles.applyFiltersText}>Aplicar Filtros</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
  },
  filterIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '50%',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  sliderContainer: { 
    marginTop: 10,
    marginBottom: 20 
  },
  sliderTrack: { 
    height: 12, 
    borderRadius: 6, 
    position: 'relative',
    justifyContent: 'center' 
  },
  sliderFill: { 
    height: 12, 
    borderRadius: 6 
  },
  sliderThumb: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    backgroundColor: 'white', 
    position: 'absolute', 
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    marginLeft: -13 // Centrar el thumb sobre el porcentaje
  },
  sliderLabels: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 12 
  },
  sliderLabelText: { 
    color: '#6B82B1', 
    fontSize: 12,
    fontWeight: '600' 
  },
  dynamicDistanceText: { 
    textAlign: 'center', 
    marginTop: 20, 
    fontWeight: '800',
    fontSize: 15
  },
  applyFiltersButton: {
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  applyFiltersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  headerRow: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  linkText: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  addressText: {
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  distanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectText: {
    fontWeight: '700',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
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
