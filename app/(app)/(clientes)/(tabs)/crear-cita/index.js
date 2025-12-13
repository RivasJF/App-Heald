import { Stack, useRouter } from 'expo-router';
// Usamos Leaflet dentro de WebView en lugar de react-native-maps
import * as Location from "expo-location";
import { useEffect, useState, useContext, useRef } from "react";
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert, Pressable, Platform, Linking, Dimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { CitaContext } from './+context/CitaContext';
import Constants from 'expo-constants';

// Constante para las deltas iniciales (nivel de zoom)
const INITIAL_DELTA = 0.005;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.65; // 65% de la pantalla

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
    if (!location) return Alert.alert('Error', 'No hay ubicación seleccionada');
    try {
      // Guardar en el contexto (si el contexto existe)
      if (typeof setSelectedLocation === 'function') {
        setSelectedLocation({ ...location, address });
      } else {
        console.warn('CitaContext no proporciona setSelectedLocation');
      }
      // Navegar a la siguiente pantalla
      try {
        router.push('/(app)/(clientes)/(tabs)/crear-cita/doctor');
      } catch (navErr) {
        console.error('Error navegando a la pantalla doctor:', navErr);
        Alert.alert('Error', 'No se pudo navegar a la pantalla siguiente.');
      }
    } catch (err) {
      console.error('Error en handleConfirmLocation:', err);
      Alert.alert('Error', 'No se pudo confirmar la ubicación.');
    }
  };

  const openExternalMap = async (coords) => {
    try {
      const { latitude, longitude } = coords || location || {};
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        console.warn('openExternalMap: coordenadas inválidas', coords);
        return Alert.alert('Error', 'No hay coordenadas para abrir en el mapa.');
      }
      const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      const supported = await Linking.canOpenURL(geoUrl);
      await Linking.openURL(supported ? geoUrl : webUrl);
    } catch (e) {
      console.error('openExternalMap error:', e);
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    }
  };

  const [webviewLoading, setWebviewLoading] = useState(false);
  const [webviewError, setWebviewError] = useState(false);
  const webviewRef = useRef(null);

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
      <View style={styles.mapContainer}>
        {(() => {
          let WebView = null;
          try {
            WebView = require('react-native-webview').WebView;
          } catch (e) {
            WebView = null;
          }

          if (WebView) {
            const osmHtml = `<!doctype html><html><head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"/><link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/><style>html,body,#map{height:100%;margin:0;padding:0} .leaflet-container{background:#fff}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet/dist/leaflet.js"></script><script> (function(){try{var lat=${location.latitude}, lng=${location.longitude}; var map=L.map('map').setView([lat,lng],15); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'© OpenStreetMap contributors'}).addTo(map); var marker=L.marker([lat,lng],{draggable:true}).addTo(map); marker.on('dragend', function(e){ var p=e.target.getLatLng(); try{ window.ReactNativeWebView.postMessage(JSON.stringify({lat:p.lat,lng:p.lng})); }catch(err){} }); map.on('click', function(e){ try{ marker.setLatLng(e.latlng); window.ReactNativeWebView.postMessage(JSON.stringify({lat:e.latlng.lat,lng:e.latlng.lng})); }catch(err){} }); window.centerOn = function(lat,lng){ try{ map.setView([lat,lng],15); marker.setLatLng([lat,lng]); }catch(err){} }; }catch(err){ console.error(err);} })();</script></body></html>`;

            return (
              <>
                <WebView
                  ref={webviewRef}
                  originWhitelist={["*"]}
                  source={{ html: osmHtml }}
                  style={styles.webview}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  mixedContentMode={'always'}
                  allowUniversalAccessFromFileURLs={true}
                  allowFileAccess={true}
                  scalesPageToFit={true}
                  onMessage={(event) => {
                    try {
                      const payload = JSON.parse(event.nativeEvent.data);
                      if (payload && (payload.lat === 0 || payload.lat) && (payload.lng === 0 || payload.lng)) {
                        const newCoords = { latitude: Number(payload.lat), longitude: Number(payload.lng) };
                        setLocation(newCoords);
                        fetchAddress(newCoords);
                      }
                    } catch (err) {}
                  }}
                  onError={(e) => { console.warn('WebView error', e); Alert.alert('Error', 'No se pudo cargar el mapa embebido.'); setWebviewError(true); }}
                />

                <TouchableOpacity
                  style={styles.centerButton}
                  onPress={() => {
                    if (webviewRef.current && location) {
                      const js = `window.centerOn(${location.latitude}, ${location.longitude});true;`;
                      webviewRef.current.injectJavaScript(js);
                    }
                  }}
                >
                  <Text style={styles.centerButtonText}>Centrar</Text>
                </TouchableOpacity>
              </>
            );
          }

          return (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>Mapa no disponible: falta WebView o falla al cargar.</Text>
              <TouchableOpacity style={styles.openMapsButton} onPress={() => openExternalMap(location)}>
                <Text style={styles.openMapsButtonText}>🗺️ Abrir en Maps</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
      </View>

      <View style={styles.infoPanel}>
        <View style={styles.infoPanelContent}>
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Ubicación seleccionada</Text>
            <Text style={styles.addressText}>{address}</Text>
            <Text style={styles.coordsText}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshLocation} disabled={isLoading}>
              <Text style={styles.refreshButtonText}>{isLoading ? '🔄 Actualizando...' : '🔄 Actualizar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleConfirmLocation}>
              <Text style={styles.saveButtonText}>Confirmar Ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
  },
  loadingText: { 
    marginTop: 10, 
    color: '#072B66',
    fontSize: 16,
    fontWeight: '500',
  },
  mapContainer: {
    height: MAP_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  webview: { 
    flex: 1,
    width: '100%',
  },
  centerButton: { 
    position: 'absolute', 
    right: 16, 
    bottom: 16, 
    backgroundColor: '#fff', 
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centerButtonText: { 
    color: '#072B66', 
    fontWeight: '700',
    fontSize: 14,
  },
  mapPlaceholder: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#F5F8FF',
  },
  mapPlaceholderText: { 
    textAlign: 'center', 
    color: '#072B66', 
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  openMapsButton: {
    backgroundColor: '#3F51B5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  openMapsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    marginTop: -20,
  },
  infoPanelContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B82B1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  addressText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#072B66', 
    marginBottom: 6,
    lineHeight: 22,
  },
  coordsText: { 
    fontSize: 13, 
    color: '#6B82B1',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    flex: 1,
    backgroundColor: '#E8EFF9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: '#3F51B5',
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3F51B5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '700',
  },
  disabledButton: { 
    opacity: 0.6,
  },
  continueButton: {
    backgroundColor: '#3F51B5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
