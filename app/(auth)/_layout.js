import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="Register" />
      <Stack.Screen name="user" />
      <Stack.Screen name="verificacion" />
      <Stack.Screen name="politicasprivaci" />
    </Stack>
  );
}
