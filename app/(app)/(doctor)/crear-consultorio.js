import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert, Platform, Linking, Dimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { createClinic, updateClinic } from '../../../src/services/clinicService';
import Constants from 'expo-constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.75; // 3/4 de la pantalla

export default function CreateClinicScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Si viene 'clinic' estamos en modo edición. Si no, es creación.
  const clinicToEdit = params.clinic ? JSON.parse(params.clinic) : null;
  const doctorId = clinicToEdit ? clinicToEdit.doctorId : params.doctorId;

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Cargando dirección...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const webviewRef = useRef(null);

  const isStandalone = Constants.appOwnership === 'standalone';
  const expoApiKey = (Constants.manifest && Constants.manifest.android && Constants.manifest.android.config && Constants.manifest.android.config.googleMaps && Constants.manifest.android.config.googleMaps.apiKey) ||
    (Constants.expoConfig && Constants.expoConfig.android && Constants.expoConfig.android.config && Constants.expoConfig.android.config.googleMaps && Constants.expoConfig.android.config.googleMaps.apiKey) || null;

  const hasRealApiKey = typeof expoApiKey === 'string' && expoApiKey.trim().length > 0 && !/put_your|replace|your_google_maps|put_your_google/i.test(expoApiKey.toLowerCase());
  const canRenderMap = !(Platform.OS === 'android' && isStandalone && !hasRealApiKey);

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
      // Si venimos en modo edición, usamos la ubicación existente
      if (clinicToEdit) {
        const initialCoords = { latitude: clinicToEdit.latitude, longitude: clinicToEdit.longitude };
        setLocation(initialCoords);
        setAddress(clinicToEdit.address || 'Ubicación existente');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permiso denegado", "Se necesita permiso para acceder a la ubicación.");
          router.back();
          return;
        }

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
          await fetchAddress(defaultLocation);
        }
      } catch (err) {
        console.error("Error en la configuración inicial de la ubicación:", err);
        Alert.alert("Error de ubicación", "No se pudo obtener la ubicación. Por favor, inténtelo de nuevo.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleRefreshLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "Se necesita permiso para acceder a la ubicación.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc.coords);
      await fetchAddress(loc.coords);
    } catch (error) {
      console.error("Error al actualizar la ubicación:", error);
      Alert.alert("Error", "No se pudo actualizar la ubicación.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (isSaving) return;
    if (!location) {
      Alert.alert("Error", "No se ha seleccionado una ubicación.");
      return;
    }

    setIsSaving(true);
    try {
      if (clinicToEdit) {
        // Actualización
        const dto = {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address,
        };
        await updateClinic(clinicToEdit.id, dto);
        Alert.alert("Éxito", "La ubicación de tu consultorio ha sido actualizada.");
        router.back();
        return;
      }

      // Creación
      if (!doctorId) {
        Alert.alert("Error", "Falta el ID del doctor para crear el consultorio.");
        setIsSaving(false);
        return;
      }

      // El API rechaza la propiedad `name` — no enviarla.
      // Envío `doctorId` tal cual (cadena), porque el backend usa IDs tipo string.
      const dto = {
        doctorId: doctorId,
        address: address,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      await createClinic(dto);
      Alert.alert("Éxito", "Tu consultorio ha sido registrado correctamente.");
      router.back();
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
        <ActivityIndicator size="large" color="#0B4EF2" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ title: 'Registrar Consultorio', headerShown: false }} />
      
      {/* Mapa que ocupa 3/4 de la pantalla */}
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
                  onError={(e) => { 
                    console.warn('WebView error', e); 
                    Alert.alert('Error', 'No se pudo cargar el mapa embebido.'); 
                  }}
                />
              </>
            );
          }

          return (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>
                Mapa no disponible: falta WebView o falla al cargar.
              </Text>
              <TouchableOpacity 
                style={styles.openMapsButton} 
                onPress={async () => {
                  const geoUrl = `geo:${location.latitude},${location.longitude}?q=${location.latitude},${location.longitude}`;
                  const webUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
                  const supported = await Linking.canOpenURL(geoUrl);
                  await Linking.openURL(supported ? geoUrl : webUrl);
                }}
              >
                <Text style={styles.openMapsButtonText}>🗺️ Abrir en Maps</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
      </View>

      {/* Panel de información que ocupa 1/4 de la pantalla */}
      <View style={styles.infoPanel}>
        <View style={styles.infoPanelContent}>
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Ubicación seleccionada</Text>
            <Text style={styles.addressText}>{address}</Text>
            <Text style={styles.coordsText}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={handleRefreshLocation} 
              disabled={isLoading}
            >
              <Text style={styles.refreshButtonText}>
                {isLoading ? '🔄 Actualizando...' : '🔄 Actualizar'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              onPress={handleSaveLocation}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>✓ Confirmar</Text>
              )}
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
});