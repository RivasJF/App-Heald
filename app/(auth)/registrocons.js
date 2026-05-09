import { router } from "expo-router";
import { useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function DoctorForm() {

const days = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

const [schedule, setSchedule] = useState(
    days.map(day => ({ day, open: "", close: "" }))
);

const updateSchedule = (dayIndex, field, value) => {
    const updated = [...schedule];
    updated[dayIndex][field] = value;
    setSchedule(updated);
};

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
    <TextInput style={styles.input} placeholder="Cardiología, Pediatría, etc." />

    <Text style={styles.label}>Teléfono del consultorio</Text>
    <TextInput style={styles.input} placeholder="55 1234 5678" keyboardType="phone-pad" />

    <Text style={styles.section}>Dirección del consultorio</Text>

    <TextInput style={styles.input} placeholder="Calle y Número" />
    <TextInput style={styles.input} placeholder="Entre calles" />
    <TextInput style={styles.input} placeholder="Colonia" />
    <TextInput style={styles.input} placeholder="Municipio / Ciudad" />
    <TextInput style={styles.input} placeholder="Código postal" keyboardType="numeric" />
    <TextInput style={styles.input} placeholder="Referencia adicional" />

    <Text style={styles.section}>Horarios de Atención</Text>
    <Text style={styles.subText}>Define cada día por separado</Text>

    {schedule.map((item, index) => (
        <View key={index} style={styles.dayRow}>
        <Text style={styles.dayLabel}>{item.day}</Text>

        <View style={styles.timeRow}>
            <TextInput
            style={styles.timeInput}
            placeholder="Apertura"
            value={item.open}
            onChangeText={(t) => updateSchedule(index, "open", t)}
            />
            <TextInput
            style={styles.timeInput}
            placeholder="Cierre"
            value={item.close}
            onChangeText={(t) => updateSchedule(index, "close", t)}
            />
        </View>
        </View>
    ))}

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
    backgroundColor: 'rgba(255, 255, 255, 0.7)' 
},
title: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center" },
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
subText: { fontSize: 13, opacity: 0.7, marginBottom: 10 },
dayRow: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
},
dayLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
},
timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
},
timeInput: {
    backgroundColor: "#EFEFEF",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    textAlign: "center",
},
button: {
    backgroundColor: "#3B82F6",
    padding: 15,
    borderRadius: 14,
    marginVertical: 25,
},
buttonText: { textAlign: "center", fontSize: 18, color: "#fff", fontWeight: "700" },
});
