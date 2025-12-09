import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";

const ACCENT_COLOR = "#3F51B5";

export default function ConfiguracionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* El título se mostrará en la cabecera de la navegación */}
      <Stack.Screen options={{ title: "Configuración", headerShown: true }} />

      <Text style={styles.title}>Configuración de la Cuenta</Text>
      <Text style={styles.content}>
        Aquí podrás ajustar las notificaciones, cambiar tu contraseña y más.
      </Text>

      <TouchableOpacity onPress={() => router.back()} style={styles.button}>
        <Text style={styles.buttonText}>Volver al Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    backgroundColor: ACCENT_COLOR,
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});