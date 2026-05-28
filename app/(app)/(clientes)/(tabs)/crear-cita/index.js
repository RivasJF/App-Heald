import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { CitaContext } from './+context/CitaContext';

const DEFAULT_LOCATION = {
  latitude: 40.7128,
  longitude: -74.0060,
};

const UI_COLORS = {
  background: '#121826',
  surface: '#1a2235',
  accent: '#4ba3e3',
  textSecondary: '#6B82B1',
};

const LOCATION_TIMEOUT_MS = 15000; // Aumentamos a 15 segundos para mayor estabilidad

const withTimeout = (promise, timeoutMs) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

const formatAddress = (addressData) => {
  if (!addressData) return 'Dirección no encontrada.';
  const street = addressData.street || '';
  const streetNumber = addressData.streetNumber || '';
  const city = addressData.city || '';
  const region = addressData.region || '';
  return `${street} ${streetNumber}, ${city}, ${region}`.replace(/\s+,/g, ',').trim();
};

const buildMapHtml = (latitude, longitude, isDarkMode, accentColor) => {
  const bgColor = isDarkMode ? '#1a2235' : '#FFFFFF';
  const iconColor = isDarkMode ? '#4ba3e3' : accentColor;
  const borderColor = isDarkMode ? '#252d41' : '#E0E0E0';

  return `<!doctype html><html><head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"/><link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/><style>
      html,body,#map{height:100%;margin:0;padding:0}
      .leaflet-container{background:${bgColor}}
      .leaflet-control-zoom { border: none !important; margin-left: 15px !important; margin-bottom: 25px !important; }
      .leaflet-bar a { background-color: ${bgColor} !important; color: ${iconColor} !important; border-bottom: 1px solid ${borderColor} !important; }
    </style></head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script>
      (function(){
        try {
          var lat=${latitude}, lng=${longitude};
          var map = L.map('map', { zoomControl: false }).setView([lat,lng], 15);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
            maxZoom: 19, 
            attribution: '© OpenStreetMap contributors' 
          }).addTo(map);

          L.control.zoom({ position: 'bottomleft' }).addTo(map);
          
          var marker = L.marker([lat,lng],{draggable:true}).addTo(map);
          
          marker.on('dragend', function(e){
            var p = e.target.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({lat:p.lat,lng:p.lng}));
          });

          map.on('click', function(e){
            marker.setLatLng(e.latlng);
            window.ReactNativeWebView.postMessage(JSON.stringify({lat:e.latlng.lat,lng:e.latlng.lng}));
          });

          window.centerOn = function(lat,lng){
            map.setView([lat,lng],15);
            marker.setLatLng([lat,lng]);
          };
        } catch(err) { console.error(err); }
      })();
    </script>
  </body>
  </html>`;
};

export default function SelectLocationScreen() {
  const router = useRouter();
  const { setSelectedLocation } = useContext(CitaContext);
  const { colors, isDarkMode, statusBarStyle } = useTheme();

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Cargando dirección...");
  const [isLoading, setIsLoading] = useState(true);
  const [webviewError, setWebviewError] = useState(false);
  const webviewRef = useRef(null);

  // Estados para la Búsqueda y Filtros
  const SNAP_VALUES = [1, 5, 10, 20];
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [tempDistanceRange, setTempDistanceRange] = useState(10);
  const [distanceRange, setDistanceRange] = useState(10);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isInputtingAddress, setIsInputtingAddress] = useState(false);
  const [manualAddressInput, setManualAddressInput] = useState("");
  const [backupLocation, setBackupLocation] = useState(null);
  const [backupAddress, setBackupAddress] = useState(null);

  const WebView = useMemo(() => {
    try {
      return require('react-native-webview').WebView;
    } catch (error) {
      return null;
    }
  }, []);

  const fetchAddress = useCallback(async (coords) => {
    try {
      setAddress("Buscando dirección...");
      const reverseGeocode = await Location.reverseGeocodeAsync(coords);
      const formattedAddress = formatAddress(reverseGeocode[0]);
      setAddress(formattedAddress);
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
      setAddress("Error al cargar la dirección.");
    }
  }, []);

  const getCurrentCoords = useCallback(async () => {
    const currentLocation = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      LOCATION_TIMEOUT_MS,
    );
    return currentLocation.coords;
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAddress("Permiso de ubicación denegado");
          setLocation(DEFAULT_LOCATION);
          return;
        }

        try {
          const initialCoords = await getCurrentCoords();
          setLocation(initialCoords);
          await fetchAddress(initialCoords);
        } catch (timeoutError) {
          console.warn("Timeout obteniendo ubicación, usando ubicación por defecto");
          setLocation(DEFAULT_LOCATION);
          setAddress("Ubicación por defecto");
        }
      } catch (error) {
        console.error("Error al obtener permisos:", error);
        setLocation(DEFAULT_LOCATION);
        setAddress("Ubicación por defecto");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [fetchAddress, getCurrentCoords]);

  const handleRefreshLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      try {
        const coords = await getCurrentCoords();
        setLocation(coords);
        await fetchAddress(coords);
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener la ubicación. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchAddress, getCurrentCoords]);

  const handleManualAddressSubmit = async () => {
    if (!manualAddressInput.trim()) return;
    setIsLoading(true);
    try {
      const result = await Location.geocodeAsync(manualAddressInput);
      if (result.length > 0) {
        const newCoords = { latitude: result[0].latitude, longitude: result[0].longitude };
        setLocation(newCoords);
        await fetchAddress(newCoords);
        setIsInputtingAddress(false);
      } else {
        Alert.alert("No encontrado", "No pudimos localizar esa dirección.");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al buscar la dirección.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderTouch = (evt) => {
    const x = evt.nativeEvent.locationX;
    if (sliderWidth > 0) {
      const ratio = Math.max(0, Math.min(1, x / sliderWidth));
      const index = Math.round(ratio * (SNAP_VALUES.length - 1));
      setTempDistanceRange(SNAP_VALUES[index]);
    }
  };

  const handleConfirmLocation = useCallback(() => {
    if (!location) return Alert.alert('Error', 'No hay ubicación seleccionada');
    try {
      if (typeof setSelectedLocation === 'function') {
        setSelectedLocation({ 
          ...location, 
          address, 
          radius: distanceRange * 1000, // Guardamos el radio en metros para la API
          searchQuery: searchQuery.trim(), // Enviamos el texto de búsqueda
        });
      } else {
        console.warn('CitaContext no proporciona setSelectedLocation');
      }
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
  }, [address, location, router, setSelectedLocation, distanceRange, searchQuery]);

  const openExternalMap = useCallback(async (coords) => {
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
  }, [location]);

  const handleWebViewMessage = useCallback((event) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      const hasValidLat = payload?.lat === 0 || !!payload?.lat;
      const hasValidLng = payload?.lng === 0 || !!payload?.lng;

      if (!hasValidLat || !hasValidLng) return;

      const newCoords = {
        latitude: Number(payload.lat),
        longitude: Number(payload.lng),
      };
      setLocation(newCoords);
      fetchAddress(newCoords);
    } catch (error) {
      console.warn('Payload inválido desde WebView', error);
    }
  }, [fetchAddress]);

  const handleCenterMap = useCallback(() => {
    if (!webviewRef.current || !location) return;
    const js = `window.centerOn(${location.latitude}, ${location.longitude});true;`;
    webviewRef.current.injectJavaScript(js);
  }, [location]);

  const handleCancelFilters = useCallback(() => {
    if (backupLocation) {
      setLocation(backupLocation);
      webviewRef.current?.injectJavaScript(`window.centerOn(${backupLocation.latitude}, ${backupLocation.longitude});true;`);
    }
    if (backupAddress) setAddress(backupAddress);
    setIsInputtingAddress(false);
    setManualAddressInput("");
    setBackupLocation(null);
    setBackupAddress(null);
    setShowFilters(false);
  }, [backupLocation, backupAddress, location]);

  const renderMapContent = () => {
    if (!WebView || webviewError) {
      return (
        <View style={[styles.mapPlaceholder, { backgroundColor: colors.background }]}>
          <Text style={[styles.mapPlaceholderText, { color: colors.text }]}>Mapa no disponible: falta WebView o falla al cargar.</Text>
          <TouchableOpacity style={[styles.openMapsButton, { backgroundColor: colors.primary }]} onPress={() => openExternalMap(location)}>
            <Text style={[styles.openMapsButtonText, { color: colors.white }]}>🗺️ Abrir en Maps</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const htmlContent = buildMapHtml(location.latitude, location.longitude, isDarkMode, colors.primary);

    return (
      <>
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent, baseUrl: 'https://localhost/' }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode={'always'}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccess={true}
          scalesPageToFit={true}
          onMessage={handleWebViewMessage}
          onError={(event) => {
            console.warn('WebView error', event);
            Alert.alert('Error', 'No se pudo cargar el mapa embebido.');
            setWebviewError(true);
          }}
        />

        <TouchableOpacity style={[styles.centerButton, { backgroundColor: colors.card }]} onPress={handleCenterMap}>
          <Text style={[styles.centerButtonText, { color: colors.text }]}>Centrar</Text>
        </TouchableOpacity>
      </>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando mapa y ubicación...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ marginBottom: 20, color: colors.text, fontSize: 16 }}>
          No se pudo obtener la ubicación
        </Text>
        <Pressable 
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleConfirmLocation}
        >
          <Text style={[styles.continueButtonText, { color: colors.white }]}>Continuar sin ubicación</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Selecciona Ubicación', headerShown: false }} />
      <StatusBar style={statusBarStyle} />
      <View style={styles.mapContainer}>
        {renderMapContent()}

        {/* 1. Barra de Búsqueda Superior Flotante */}
        <View style={styles.searchBarContainer}>
          <View style={[styles.searchBar, { 
              backgroundColor: isDarkMode ? 'rgba(26, 34, 53, 0.96)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: isDarkMode ? 'rgba(75, 163, 227, 0.3)' : 'rgba(0, 0, 0, 0.1)'
          }]}>
            <Ionicons name="search" size={20} color={UI_COLORS.textSecondary} style={{ marginLeft: 15 }} />
            <TextInput 
              placeholder="Buscar Especialidad, Doctor o Clínica"
              placeholderTextColor={UI_COLORS.textSecondary}
              style={[styles.searchInput, { color: isDarkMode ? 'white' : colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={[styles.filterIconButton, { backgroundColor: isDarkMode ? UI_COLORS.accent : colors.primary }]}
              onPress={() => {
                setBackupLocation(location);
                setBackupAddress(address);
                setTempDistanceRange(distanceRange);
                setShowFilters(true);
              }}
            >
              <Ionicons name="options-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[
        styles.infoPanel, 
        { 
          backgroundColor: colors.card,
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: colors.border,
          shadowColor: isDarkMode ? '#000' : '#000'
        }]}>
        <View style={styles.infoPanelContent}>
          <View style={styles.addressContainer}>
            <Text style={[styles.addressLabel, { color: colors.subtitle }]}>Ubicación seleccionada</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{address}</Text>
            <Text style={[styles.coordsText, { color: colors.subtitle }]}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.refreshButton, { backgroundColor: isDarkMode ? colors.border : '#E8EFF9' }]} onPress={handleRefreshLocation} disabled={isLoading}>
              <Text style={[styles.refreshButtonText, { color: colors.primary }]}>{isLoading ? 'Actualizando...' : 'Actualizar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleConfirmLocation}>
              <Text style={[styles.saveButtonText, { color: colors.white }]}>Confirmar Ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. Panel de Filtros (Bottom Sheet Modal) */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelFilters}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={handleCancelFilters} />
          <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sección Ubicación */}
              <Text style={[styles.sheetSectionTitle, { color: colors.text }]}>Ubicación</Text>
              {isInputtingAddress ? (
                <View style={[styles.locationInputContainer, { backgroundColor: isDarkMode ? '#121826' : colors.background }]}>
                  <TextInput
                    style={[styles.locationDisplay, { color: isDarkMode ? 'white' : colors.text }]}
                    value={manualAddressInput}
                    onChangeText={setManualAddressInput}
                    placeholder="Escribe una dirección..."
                    placeholderTextColor={colors.subtitle}
                    autoFocus
                    onSubmitEditing={handleManualAddressSubmit}
                  />
                  <TouchableOpacity onPress={handleManualAddressSubmit}>
                    <Ionicons name="search" size={22} color={isDarkMode ? UI_COLORS.accent : colors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.locationInputContainer, { backgroundColor: isDarkMode ? '#121826' : colors.background }]}>
                  <Ionicons name="location" size={20} color={isDarkMode ? UI_COLORS.accent : colors.primary} />
                  <Text style={[styles.locationDisplay, { color: isDarkMode ? 'white' : colors.text }]} numberOfLines={1}>{address}</Text>
                  <TouchableOpacity onPress={handleRefreshLocation}>
                    <Ionicons name="locate" size={22} color={isDarkMode ? UI_COLORS.accent : colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              
              <View style={styles.quickActionContainer}>
                <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: isDarkMode ? UI_COLORS.accent : colors.primary }]} onPress={handleRefreshLocation}>
                  <Text style={styles.quickActionText}>Ubicación Actual</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickActionButton, { backgroundColor: isDarkMode ? '#252d41' : colors.border }]}
                  onPress={() => setIsInputtingAddress(!isInputtingAddress)}
                >
                  <Text style={[styles.quickActionText, { color: isDarkMode ? 'white' : colors.text }]}>Ingresar Dirección</Text>
                </TouchableOpacity>
              </View>

              {/* Sección Rango de Distancia */}
              <Text style={[styles.sheetSectionTitle, { color: colors.text }]}>Rango de Distancia</Text>
              <View style={styles.sliderContainer}>
                {(() => {
                  const percentage = (SNAP_VALUES.indexOf(tempDistanceRange) / (SNAP_VALUES.length - 1)) * 100;
                  return (
                <View 
                  style={[styles.sliderTrack, { backgroundColor: isDarkMode ? '#121826' : colors.border }]}
                  onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={handleSliderTouch}
                  onResponderMove={handleSliderTouch}
                >
                      <View pointerEvents="none" style={[styles.sliderFill, { backgroundColor: isDarkMode ? UI_COLORS.accent : colors.primary, width: `${percentage}%` }]} />
                      <View pointerEvents="none" style={[styles.sliderThumb, { borderColor: isDarkMode ? UI_COLORS.accent : colors.primary, left: `${percentage}%` }]} />
                </View>
                  );
                })()}
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>1km</Text>
                  <Text style={styles.sliderLabelText}>5km</Text>
                  <Text style={styles.sliderLabelText}>10km</Text>
                  <Text style={styles.sliderLabelText}>+20km</Text>
                </View>
                <Text style={[styles.dynamicDistanceText, { color: isDarkMode ? UI_COLORS.accent : colors.primary }]}>A menos de {tempDistanceRange} km a la redonda</Text>
              </View>

              <TouchableOpacity 
                style={[styles.applyFiltersButton, { backgroundColor: isDarkMode ? UI_COLORS.accent : colors.primary }]}
                onPress={() => {
                  setDistanceRange(tempDistanceRange);
                  setBackupLocation(null);
                  setBackupAddress(null);
                  setShowFilters(false);
                }}
              >
                <Text style={styles.applyFiltersText}>Aplicar Filtros</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
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
    flex: 0.64,
    width: '100%',
    position: 'relative',
  },
  searchBarContainer: {
    position: 'absolute',
    top: 10,
    left: 15,
    right: 15,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
  },
  filterIconButton: {
    backgroundColor: '#4ba3e3',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#1a2235',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#252d41',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetSectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
    marginTop: 10,
  },
  locationInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#121826',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  locationDisplay: {
    flex: 1,
    color: 'white',
    marginHorizontal: 10,
    fontSize: 12,
  },
  quickActionContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  sliderContainer: { marginTop: 10 },
  sliderTrack: { height: 16, backgroundColor: '#121826', borderRadius: 8, position: 'relative' },
  sliderFill: { height: 16, backgroundColor: '#4ba3e3', borderRadius: 8 },
  sliderThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', position: 'absolute', top: -4, borderWidth: 2, borderColor: '#4ba3e3' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLabelText: { color: '#6B82B1', fontSize: 10 },
  dynamicDistanceText: { color: '#4ba3e3', textAlign: 'center', marginTop: 15, fontWeight: '700' },
  specialtiesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    marginTop: 5 
  },
  specialtyCard: { 
    width: '48%', 
    backgroundColor: '#121826',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center', 
    marginBottom: 12 
  },
  specialtyCardActive: {
    borderColor: '#4ba3e3',
    borderWidth: 2,
  },
  specialtyIconCircle: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#1a2235', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  specialtyName: { 
    color: 'white', 
    fontSize: 12, 
    textAlign: 'center',
    fontWeight: '600'
  },
  applyFiltersButton: {
    backgroundColor: '#4ba3e3',
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  applyFiltersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
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
    flex: 0.36,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    marginTop: 0,
  },
  infoPanelContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-around',
  },
  addressContainer: {
    marginBottom: 5,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B82B1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 0,
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
