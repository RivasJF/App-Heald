import { Slot, Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { ActivityIndicator, View, Alert } from "react-native";
import { useEffect } from "react";
import * as Location from 'expo-location';

export default function RootLayout() {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permiso de Ubicación",
          "La aplicación necesita acceso a tu ubicación para funcionar correctamente. Por favor, habilítalo en la configuración."
        );
      }
    };

    if (isAuthenticated) requestLocationPermission();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Slot />;
}
