import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

export default function Consultorio() {
  const router = useRouter();

  const [direccion, setDireccion] = useState('');
  const [colonia, setColonia] = useState('');
  const [calle, setCalle] = useState('');

  const guardar = () => {
    alert("Datos del consultorio actualizados ✔");
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>⬅ Regresar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Mi Consultorio</Text>

      <TextInput style={styles.input} placeholder="Dirección" value={direccion} onChangeText={setDireccion} />
      <TextInput style={styles.input} placeholder="Colonia" value={colonia} onChangeText={setColonia} />
      <TextInput style={styles.input} placeholder="Calle" value={calle} onChangeText={setCalle} />

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
