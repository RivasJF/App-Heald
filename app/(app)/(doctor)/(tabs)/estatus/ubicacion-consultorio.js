import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { createClinic, updateClinic } from '../../../../../src/services/clinicService';

const INITIAL_DELTA = 0.005;

export default function UbicacionConsultorioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Si viene 'clinic', estamos en modo edición. Si no, es creación.
  const clinicToEdit = params.clinic ? JSON.parse(params.clinic) : null;
  const doctorId = clinicToEdit ? clinicToEdit.doctorId : params.doctorId;

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Cargando dirección...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAddress = async (coords) => {
    try {
      setAddress("Buscando dirección...");
      const reverseGeocode = await Location.reverseGeocodeAsync(coords);
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = `${addr.street} ${addr.streetNumber || ''}, ${addr.city}, ${addr.region}`;
        setAddress(formattedAddress);
      } else {
        setAddress("Dirección no encontrada.");
      }
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
      setAddress("Error al cargar la dirección.");
    }
  };

  useEffect(() => {
    (async () => {
      // Si estamos editando, usamos la ubicación existente.
      if (clinicToEdit) {
        const initialCoords = { latitude: clinicToEdit.latitude, longitude: clinicToEdit.longitude };
        setLocation(initialCoords);
        setAddress(clinicToEdit.address);
        setIsLoading(false);
      } else {
        // Si estamos creando, obtenemos la ubicación actual.
        setIsLoading(true);
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permiso denegado", "Se necesita permiso para acceder a la ubicación.");
          router.back();
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        await fetchAddress(loc.coords);
        setIsLoading(false);
      }
    })();
  }, []);

  const handleMapPress = (e) => {
    const newCoords = e.nativeEvent.coordinate;
    setLocation(newCoords);
    fetchAddress(newCoords);
  };

  const handleSaveLocation = async () => {
    if (!location) {
      Alert.alert("Error", "No se ha seleccionado una ubicación.");
      return;
    }
    setIsSaving(true);

    try {
      if (clinicToEdit) {
        // Modo Actualización (PATCH)
        const dto = {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address,
        };
        await updateClinic(clinicToEdit.id, dto);
        Alert.alert("Éxito", "La ubicación de tu consultorio ha sido actualizada.");
      } else {
        // Modo Creación (POST)
        if (!doctorId) {
          Alert.alert("Error", "Falta el ID del doctor para crear el consultorio.");
          setIsSaving(false);
          return;
        }
        const dto = {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address,
          doctorId: doctorId,
        };
        await createClinic(dto);
        Alert.alert("Éxito", "Tu consultorio ha sido registrado correctamente.");
      }
      router.back(); // Volver a la pantalla anterior
    } catch (error) {
      const errorMessage = error?.message || "No se pudo guardar la ubicación.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={{ marginTop: 10 }}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: clinicToEdit ? 'Actualizar Consultorio' : 'Registrar Consultorio', headerShown: false }} />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: INITIAL_DELTA,
          longitudeDelta: INITIAL_DELTA,
        }}
        onPress={handleMapPress}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: INITIAL_DELTA,
          longitudeDelta: INITIAL_DELTA,
        }}
      >
        <Marker coordinate={location} title="Ubicación del Consultorio" description={address} />
      </MapView>
      <View style={styles.infoPanel}>
        <Text style={styles.addressText}>📍 {address}</Text>
        <Text style={styles.coordsText}>Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSaveLocation}
          disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Confirmar Ubicación</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 3, width: '100%' },
  infoPanel: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F8FF',
    borderTopWidth: 1,
    borderTopColor: '#D7E8FF',
    justifyContent: 'center',
  },
  addressText: { fontSize: 16, fontWeight: '600', color: '#072B66', marginBottom: 8 },
  coordsText: { fontSize: 14, color: '#6B82B1', marginBottom: 16 },
  saveButton: {
    backgroundColor: '#3F51B5',
    padding: 15,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  disabledButton: { opacity: 0.7 },
});