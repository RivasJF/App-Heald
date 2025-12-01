import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function User() {
return (
    <View style={styles.container}>
    
    <Text style={styles.title}>Selecciona tu tipo de usuario</Text>

      {/* BOTÓN PACIENTE */}
    <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
    >
        <Text style={styles.buttonText}>Soy Paciente</Text>
    </TouchableOpacity>

      {/* BOTÓN DOCTOR */}
    <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/registrover2")}
    >
        <Text style={styles.buttonText}>Soy Doctor</Text>
    </TouchableOpacity>

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