import { Stack } from 'expo-router';
import { CitaProvider } from './+context/CitaContext';

export default function CrearCitaLayout() {
  return (
    <CitaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* El screen index se renderiza primero */}
        <Stack.Screen name="index" />
        {/* Las demás pantallas con presentación modal opcional */}
        <Stack.Screen name="doctor" />
        <Stack.Screen name="fecha" />
        <Stack.Screen name="resumen" />
        <Stack.Screen name="ticket" />
      </Stack>
    </CitaProvider>
  );
}
