import { Stack, useRouter } from 'expo-router';
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState, useContext } from "react";
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert, Pressable, Platform, Linking } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { CitaContext } from './+context/CitaContext';
import Constants from 'expo-constants';

// Constante para las deltas iniciales (nivel de zoom)
const INITIAL_DELTA = 0.005;

export default function SelectLocationScreen() {
  const router = useRouter();
  const { setSelectedLocation } = useContext(CitaContext);

  const [location, setLocation] = useState(null); // { latitude: number, longitude: number }
  const [address, setAddress] = useState("Cargando dirección...");
  const [isLoading, setIsLoading] = useState(true);

  // Detectar si estamos en una build standalone Android y si falta API key de Google Maps
  const isStandalone = Constants.appOwnership === 'standalone';
  const expoApiKey = (Constants.manifest && Constants.manifest.android && Constants.manifest.android.config && Constants.manifest.android.config.googleMaps && Constants.manifest.android.config.googleMaps.apiKey) ||
    (Constants.expoConfig && Constants.expoConfig.android && Constants.expoConfig.android.config && Constants.expoConfig.android.config.googleMaps && Constants.expoConfig.android.config.googleMaps.apiKey) || null;

  // Considerar cadenas placeholder como "sin clave real" para evitar intentar renderizar MapView
  const hasRealApiKey = typeof expoApiKey === 'string' && expoApiKey.trim().length > 0 && !/put_your|replace|your_google_maps|put_your_google/i.test(expoApiKey.toLowerCase());
  const canRenderMap = !(Platform.OS === 'android' && isStandalone && !hasRealApiKey);

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
      try {
        // Primero solicitar permiso
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAddress("Permiso de ubicación denegado");
          // Usar una ubicación por defecto (ej: centro de una ciudad)
          const defaultLocation = {
            latitude: 40.7128,
            longitude: -74.0060,
          };
          setLocation(defaultLocation);
          setIsLoading(false);
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
          const initialCoords = loc.coords;
          setLocation(initialCoords);
          await fetchAddress(initialCoords);
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
        const defaultLocation = {
          latitude: 40.7128,
          longitude: -74.0060,
        };
        setLocation(defaultLocation);
        setAddress("Ubicación por defecto");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 3. Manejador de toque en el mapa
  const handleMapPress = (e) => {
    const newCoords = e.nativeEvent.coordinate;
    setLocation(newCoords);
    fetchAddress(newCoords);
  };

  // 4. Manejador para actualizar ubicación actual
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

  // 5. Manejador para guardar y continuar
  const handleConfirmLocation = () => {
    if (location) {
      // Guardar en el contexto
      setSelectedLocation({ ...location, address });
      // Navegar a la siguiente pantalla
      router.push('/(app)/(clientes)/(tabs)/crear-cita/doctor');
    }
  };

  const openExternalMap = async (coords) => {
    try {
      const { latitude, longitude } = coords || location || {};
      if (!latitude || !longitude) return Alert.alert('Error', 'No hay coordenadas para abrir en el mapa.');
      const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      const supported = await Linking.canOpenURL(geoUrl);
      await Linking.openURL(supported ? geoUrl : webUrl);
    } catch (e) {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    }
  };

  const [webviewLoading, setWebviewLoading] = useState(false);
  const [webviewError, setWebviewError] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B4EF2" />
        <Text style={{ marginTop: 10, color: '#072B66' }}>Cargando mapa y ubicación...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ marginBottom: 20, color: '#072B66', fontSize: 16 }}>
          No se pudo obtener la ubicación
        </Text>
        <Pressable 
          style={styles.continueButton}
          onPress={handleConfirmLocation}
        >
          <Text style={styles.continueButtonText}>Continuar sin ubicación</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Selecciona Ubicación', headerShown: false }} />
      {canRenderMap ? (
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
      ) : (
        (() => {
          // Intentar cargar WebView dinámicamente (no requerido en tiempo de compilación)
          let WebView = null;
          try {
            // require dinámico para evitar errores si no está instalado
            // eslint-disable-next-line global-require
            WebView = require('react-native-webview').WebView;
          } catch (e) {
            WebView = null;
          }

          if (WebView) {
            const osmHtml = `<!doctype html><html><head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"/><link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/><style>html,body,#map{height:100%;margin:0;padding:0} .leaflet-container{background:#fff}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet/dist/leaflet.js"></script><script> (function(){try{var lat=${location.latitude}, lng=${location.longitude}; var map=L.map('map').setView([lat,lng],15); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'© OpenStreetMap contributors'}).addTo(map); var marker=L.marker([lat,lng],{draggable:true}).addTo(map); marker.on('dragend', function(e){ var p=e.target.getLatLng(); try{ window.ReactNativeWebView.postMessage(JSON.stringify({lat:p.lat,lng:p.lng})); }catch(err){} }); }catch(err){ console.error(err);} })();</script></body></html>`;

              return (
                <>
                  {webviewLoading && (
                    <View style={styles.webviewLoadingOverlay}>
                      <ActivityIndicator size="large" color="#0B4EF2" />
                      <Text style={{ marginTop: 8, color: '#072B66' }}>Cargando mapa...</Text>
                    </View>
                  )}
                  <WebView
                    originWhitelist={["*"]}
                    source={{ html: osmHtml }}
                    style={styles.map}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mixedContentMode={'always'}
                    allowUniversalAccessFromFileURLs={true}
                    allowFileAccess={true}
                    scalesPageToFit={true}
                    onMessage={(event) => {
                      try {
                        const payload = JSON.parse(event.nativeEvent.data);
                        if (payload && payload.lat && payload.lng) {
                          const newCoords = { latitude: payload.lat, longitude: payload.lng };
                          setLocation(newCoords);
                          fetchAddress(newCoords);
                        }
                      } catch (err) {
                        console.warn('Invalid message from webview', err);
                      }
                    }}
                    onLoadStart={() => { setWebviewLoading(true); setWebviewError(false); }}
                    onLoadEnd={() => { setWebviewLoading(false); }}
                    onError={(e) => { console.warn('WebView error', e); setWebviewLoading(false); setWebviewError(true); }}
                  />
                  {webviewError && (
                    <View style={styles.mapPlaceholder}>
                      <Text style={{ textAlign: 'center', color: '#072B66', marginBottom: 12 }}>No se pudo cargar el mapa embebido.</Text>
                      <TouchableOpacity style={styles.refreshButton} onPress={() => openExternalMap(location)}>
                        <Text style={styles.refreshButtonText}>Abrir en Maps</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.saveButton, { marginTop: 12 }]} onPress={handleConfirmLocation}>
                        <Text style={styles.saveButtonText}>Continuar sin mapa</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              );
          }

          // Si no hay WebView, caer al comportamiento anterior (abrir Maps externo)
          return (
            <View style={styles.mapPlaceholder}>
              <Text style={{ textAlign: 'center', color: '#072B66', marginBottom: 12 }}>Mapa no disponible en esta versión. Puedes abrir Google Maps externo.</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={() => openExternalMap(location)}>
                <Text style={styles.refreshButtonText}>Abrir en Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { marginTop: 12 }]} onPress={handleConfirmLocation}>
                <Text style={styles.saveButtonText}>Continuar sin mapa</Text>
              </TouchableOpacity>
            </View>
          );
        })()
      )}

      <View style={styles.infoPanel}>
        <Text style={styles.addressText}>📍 {address}</Text>
        <Text style={styles.coordsText}>Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshLocation} disabled={isLoading}>
            <Text style={styles.refreshButtonText}>{isLoading ? '🔄 Actualizando...' : '🔄 Actualizar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleConfirmLocation}>
            <Text style={styles.saveButtonText}>Confirmar Ubicación</Text>
          </TouchableOpacity>
        </View>
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
  mapPlaceholder: {
    flex: 3,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    padding: 20,
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  continueButton: {
    backgroundColor: '#0B4EF2',
    padding: 15,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
