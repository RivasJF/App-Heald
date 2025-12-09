import { Stack } from 'expo-router';

export default function PerfilLayout() {
  return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* El screen index se renderiza primero */}
        <Stack.Screen name="mis-citas" />
        {/* Las demás pantallas con presentación modal opcional */}
        <Stack.Screen name="configuracion" />

      </Stack>
  );
}