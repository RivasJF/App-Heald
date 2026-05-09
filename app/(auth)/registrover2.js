import { router } from "expo-router";
import { useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function DoctorForm2() {

const [daysSelected, setDaysSelected] = useState([]);
const toggleDay = (day) => {
    if (daysSelected.includes(day)) {
    setDaysSelected(daysSelected.filter(d => d !== day));
    } else {
    setDaysSelected([...daysSelected, day]);
    }
};

const [openHour, setOpenHour] = useState("");
const [closeHour, setCloseHour] = useState("");

return (
    <ImageBackground
      source={require('../../assets/fondo.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
    <ScrollView style={styles.container}>
    <Text style={styles.title}>Registro de Consultorio</Text>

    <Text style={styles.label}>Nombre del doctor</Text>
    <TextInput style={styles.input} placeholder="Dr. Juan Pérez" />

    <Text style={styles.label}>Especialidad</Text>
    <TextInput style={styles.input} placeholder="Cardiología" />

    <Text style={styles.label}>Teléfono del consultorio</Text>
    <TextInput style={styles.input} placeholder="55 1234 5678" keyboardType="phone-pad" />

    <Text style={styles.section}>Dirección del consultorio</Text>
    <TextInput style={styles.input} placeholder="Calle y Número" />
    <TextInput style={styles.input} placeholder="Entre calles" />
    <TextInput style={styles.input} placeholder="Colonia" />
    <TextInput style={styles.input} placeholder="Municipio / Ciudad" />
    <TextInput style={styles.input} placeholder="Código Postal" keyboardType="numeric" />

    <Text style={styles.section}>Días de Atención</Text>

    <View style={styles.chipsContainer}>
        {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map((day) => (
        <TouchableOpacity
            key={day}
            style={[
            styles.chip,
            daysSelected.includes(day) && styles.chipSelected,
            ]}
            onPress={() => toggleDay(day)}
        >
            <Text style={[
            styles.chipText,
            daysSelected.includes(day) && styles.chipTextSelected
            ]}>
            {day}
            </Text>
        </TouchableOpacity>
        ))}
    </View>

    <Text style={styles.section}>Horario para los días seleccionados</Text>

    <TextInput
        style={styles.input}
        placeholder="Hora apertura"
        value={openHour}
        onChangeText={setOpenHour}
    />

    <TextInput
        style={styles.input}
        placeholder="Hora cierre"
        value={closeHour}
        onChangeText={setCloseHour}
    />

    <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
    >
        <Text style={styles.buttonText}>Continuar</Text>
    </TouchableOpacity>

    </ScrollView>
    </ImageBackground>
);
}

const styles = StyleSheet.create({
backgroundImage: {
    flex: 1,
},
container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.7)' // Capa consistente con Login y Register
},
title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 20 },
label: { marginTop: 10, fontSize: 14, fontWeight: "600" },
input: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 10,
    elevation: 1,
},
section: { marginTop: 20, fontSize: 18, fontWeight: "700" },
chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
},
chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
},
chipSelected: {
    backgroundColor: "#3B82F6",
},
chipText: {
    fontSize: 14,
    color: "#333",
},
chipTextSelected: {
    color: "#fff",
},
button: {
    backgroundColor: "#3B82F6",
    padding: 15,
    borderRadius: 14,
    marginVertical: 25,
},
buttonText: { textAlign: "center", fontSize: 18, color: "#fff", fontWeight: "700" },
});
