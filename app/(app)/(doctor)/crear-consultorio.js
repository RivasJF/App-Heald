import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { createClinic } from '../../../src/services/clinicService';

const INITIAL_DELTA = 0.005;

export default function CreateClinicScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { doctorId } = params;

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
      setIsLoading(true);
      try {
        // Primero solicitar permiso
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permiso denegado", "Se necesita permiso para acceder a la ubicación.");
          router.back();
          return;
        }

        // Intentar obtener la ubicación con timeout
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );

        try {
          const loc = await Promise.race([locationPromise, timeoutPromise]);
          setLocation(loc.coords);
          await fetchAddress(loc.coords);
        } catch (timeoutError) {
          console.warn("Timeout obteniendo ubicación, usando ubicación por defecto");
          const defaultLocation = {
            latitude: 40.7128,
            longitude: -74.0060,
          };
          setLocation(defaultLocation);
          setAddress("Ubicación por defecto");
        }
      } catch (error) {
        console.error("Error al obtener permisos:", error);
        Alert.alert("Error", "No se pudo obtener la ubicación.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleMapPress = (e) => {
    const newCoords = e.nativeEvent.coordinate;
    setLocation(newCoords);
    fetchAddress(newCoords);
  };

  const handleRefreshLocation = async () => {
    setIsLoading(true);
    try {
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      try {
        const loc = await Promise.race([locationPromise, timeoutPromise]);
        const coords = loc.coords;
        setLocation(coords);
        await fetchAddress(coords);
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener la ubicación. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!location || !doctorId) {
      Alert.alert("Error", "Faltan datos para crear el consultorio.");
      return;
    }
    setIsSaving(true);
    try {
      const dto = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: address,
        doctorId: doctorId,
      };
      await createClinic(dto);
      Alert.alert("Éxito", "Tu consultorio ha sido registrado correctamente.");
      router.back(); // Volver a la pantalla anterior
    } catch (error) {
      const errorMessage = error?.message || "No se pudo registrar el consultorio.";
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
      <Stack.Screen options={{ title: 'Registrar Consultorio', headerShown: false }} />
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshLocation} disabled={isLoading}>
            <Text style={styles.refreshButtonText}>{isLoading ? '🔄 Actualizando...' : '🔄 Actualizar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSaveLocation}
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Confirmar Ubicación</Text>}
          </TouchableOpacity>
        </View>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  refreshButton: {
    flex: 1,
    backgroundColor: '#6B82B1',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3F51B5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { opacity: 0.7 },
});