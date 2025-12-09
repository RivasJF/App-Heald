import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

export default function MisDatos() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const guardar = () => {
    alert("Datos del doctor actualizados ✔");
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>⬅ Regresar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Mis Datos</Text>

      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Edad" value={edad} onChangeText={setEdad} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Especialidad" value={especialidad} onChangeText={setEspecialidad} />
      <TextInput style={[styles.input, { height: 100 }]} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} multiline />

      <TouchableOpacity style={styles.confirmButton} onPress={guardar}>
        <Text style={styles.confirmButtonText}>Confirmar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, backgroundColor: '#FAFAFA' },
  backButton: { backgroundColor: '#6A5ACD', padding: 10, borderRadius: 10, width: 140, marginBottom: 15 },
  backButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  confirmButton: { backgroundColor: '#32CD32', padding: 15, borderRadius: 12, marginTop: 30, alignItems: 'center', width: '70%', alignSelf: 'center' },
  confirmButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
