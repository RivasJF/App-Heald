import { router } from "expo-router";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRegisterStore } from "../../src/store/register.store";

export default function User() {
  // Guardamos el rol seleccionado en el store y navegamos a registro
  const { setRole } = useRegisterStore();

  const handleUserTypeSelection = (userType) => {
    // Guardar rol en el store
    setRole(userType);
    // Navegar a registro
    router.push('/Register');
  };

  return (
    <ImageBackground
      source={require('../../assets/fondo.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
      
        <Text style={styles.title}>Selecciona tu tipo de usuario</Text>

        {/* BOTÓN PACIENTE */}
        <TouchableOpacity style={styles.button} onPress={() => handleUserTypeSelection('CLIENT')}>
            <Text style={styles.buttonText}>Soy Paciente</Text>
        </TouchableOpacity>

        {/* BOTÓN DOCTOR */}
        <TouchableOpacity style={styles.button} onPress={() => handleUserTypeSelection('DOCTOR')}>
            <Text style={styles.buttonText}>Soy Doctor</Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Capa consistente con el login
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 40,
    color: "#072B66", // Azul oscuro de la marca
  },
  button: {
    backgroundColor: "#4CAFED", // Azul claro consistente
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});