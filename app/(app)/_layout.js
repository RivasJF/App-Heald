import { Slot, Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { ActivityIndicator, View, Alert } from "react-native";
import { useEffect } from "react";
import * as Location from 'expo-location'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1min
      retry: 1,
    },
  },
});


export default function RootLayout() {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        let { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            "Permiso de Ubicación Requerido",
            "La aplicación necesita acceso a tu ubicación para funcionar correctamente. Por favor, habilítalo en la configuración del dispositivo."
          );
        }
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

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
