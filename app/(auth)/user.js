import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { registerUser } from "../../src/services/userServices";

export default function User() {
  // 1. Recibimos los parámetros de la pantalla de registro
  const registrationData = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  // 2. Creamos una función para manejar la selección del tipo de usuario
  const handleUserTypeSelection = async (userType) => {
    const userData = {
      name: registrationData.nombre,
      email: registrationData.email,
      password: registrationData.password,
      phoneNumber: registrationData.telefono, // Asegúrate que el formato sea el esperado por tu API
      birthDate: registrationData.fechaNacimiento,
      role: userType, // 'CLIENT' o 'DOCTOR'
    };

    console.log("Enviando datos a la API:", userData);

    setLoading(true);
    try {
      await registerUser(userData);
      Alert.alert(
        "Registro Exitoso",
        "Tu cuenta ha sido creada. Ahora puedes iniciar sesión."
      );
      // 3. Navegamos a login después del registro exitoso
      router.push("/login");
    } catch (error) {
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      Alert.alert("Error de Registro", errorMessage);
      console.error("Detalles del error de registro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
    
    <Text style={styles.title}>Selecciona tu tipo de usuario</Text>

      {/* BOTÓN PACIENTE */}
    <TouchableOpacity style={styles.button} onPress={() => handleUserTypeSelection('CLIENT')} disabled={loading}>
        <Text style={styles.buttonText}>Soy Paciente</Text>
    </TouchableOpacity>

      {/* BOTÓN DOCTOR */}
    <TouchableOpacity style={styles.button} onPress={() => handleUserTypeSelection('DOCTOR')} disabled={loading}>
        <Text style={styles.buttonText}>Soy Doctor</Text>
    </TouchableOpacity>

    {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#3B82F6" />}

    </View>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#F5F5F5",
},
title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 40,
},
button: {
    backgroundColor: "#3B82F6",
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