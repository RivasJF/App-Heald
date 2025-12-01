import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="Register" />
      <Stack.Screen name="registrocons" />
      <Stack.Screen name="registrover2" />
      <Stack.Screen name="user" />
    </Stack>
  );
}
