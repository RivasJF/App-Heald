import { Stack } from 'expo-router';

export default function DoctorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* La navegación por pestañas es la ruta principal */}
      <Stack.Screen name="(tabs)" />
      {/* La pantalla para crear el perfil es una pantalla separada en el mismo nivel */}
      <Stack.Screen name="crear-perfil" options={{ presentation: 'modal' }} />
      <Stack.Screen name="ubicacion-consultorio" options={{ presentation: 'modal' }} />
    </Stack>
  );
}