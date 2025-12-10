import { Stack, useRouter } from 'expo-router';
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState, useContext } from "react";
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { CitaContext } from './+context/CitaContext';

// Constante para las deltas iniciales (nivel de zoom)
const INITIAL_DELTA = 0.005;

export default function SelectLocationScreen() {
  const router = useRouter();
  const { setSelectedLocation } = useContext(CitaContext);

  const [location, setLocation] = useState(null); // { latitude: number, longitude: number }
  const [address, setAddress] = useState("Cargando dirección...");
  const [isLoading, setIsLoading] = useState(true);

  // 1. Función para obtener la dirección (Geocodificación Inversa)
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

  // 2. Efecto para obtener la ubicación actual al inicio
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      // Ahora solo verificamos el permiso, no lo solicitamos.
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permiso Requerido", 
          "No se puede acceder a la ubicación. Por favor, habilita el permiso en la configuración de tu dispositivo para continuar."
        );
        setIsLoading(false);
        router.back(); // Enviamos al usuario de vuelta si no hay permiso.
        return; 
      }
      const loc = await Location.getCurrentPositionAsync({});
      const initialCoords = loc.coords;
      setLocation(initialCoords);
      await fetchAddress(initialCoords);
      setIsLoading(false);
    })();
  }, []);

  // 3. Manejador de toque en el mapa
  const handleMapPress = (e) => {
    const newCoords = e.nativeEvent.coordinate;
    setLocation(newCoords);
    fetchAddress(newCoords);
  };

  // 4. Manejador para guardar y continuar
  const handleConfirmLocation = () => {
    if (location) {
      // Guardar en el contexto
      setSelectedLocation({ ...location, address });
      // Navegar a la siguiente pantalla
      router.push('/(app)/(clientes)/(tabs)/crear-cita/doctor');
    }
  };

  if (isLoading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B4EF2" />
        <Text style={{ marginTop: 10, color: '#072B66' }}>Cargando mapa y ubicación...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Selecciona Ubicación', headerShown: false }} />
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
        <Marker
          coordinate={location}
          title="Ubicación Seleccionada"
          description={address}
        />
      </MapView>

      <View style={styles.infoPanel}>
        <Text style={styles.addressText}>📍 {address}</Text>
        <Text style={styles.coordsText}>Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleConfirmLocation}>
          <Text style={styles.saveButtonText}>Confirmar Ubicación</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 3,
    width: '100%',
  },
  infoPanel: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F8FF',
    borderTopWidth: 1,
    borderTopColor: '#D7E8FF',
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#072B66',
    marginBottom: 8,
  },
  coordsText: {
    fontSize: 14,
    color: '#6B82B1',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#0B4EF2',
    padding: 15,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
