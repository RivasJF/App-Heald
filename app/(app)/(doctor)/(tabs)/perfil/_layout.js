import { Stack } from 'expo-router';

export default function PerfilLayout() {
  return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* El screen index se renderiza primero */}
        <Stack.Screen name="perfil" />
        <Stack.Screen name="misDatos" />

      </Stack>
  );
}