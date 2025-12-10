import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { createDoctor } from '../../../src/services/doctorService';

export default function CreateDoctorProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [speciality, setSpeciality] = useState('');
  const [biography, setBiography] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSaveProfile = async () => {
    if (!speciality.trim() || !biography.trim()) {
      Alert.alert("Campos Incompletos", "Por favor, completa tu especialidad y biografía.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const createDoctorDto = {
        userId: user.id,
        speciality,
        biography,
      };
      await createDoctor(createDoctorDto);

      Alert.alert("Perfil Creado", "Tu perfil profesional ha sido creado con éxito.");
      // Redirige al doctor a su pestaña de perfil, que ahora sí cargará los datos.
      router.replace('/(app)/(doctor)/(tabs)/perfil/perfil');

    } catch (err) {
      const errorMessage = err?.message || "No se pudo crear el perfil. Inténtalo de nuevo.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <Text style={styles.title}>Completa tu Perfil</Text>
        <Text style={styles.subtitle}>
          Para continuar, por favor ingresa tu información profesional.
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.label}>Especialidad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Cardiología, Dermatología..."
          value={speciality}
          onChangeText={setSpeciality}
        />

        <Text style={styles.label}>Biografía Corta</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Una breve descripción sobre ti y tu experiencia."
          value={biography}
          onChangeText={setBiography}
          multiline
        />

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Perfil</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF', justifyContent: 'center' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#072B66', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B82B1', textAlign: 'center', marginTop: 8, marginBottom: 30 },
  label: { fontSize: 14, color: '#3F51B5', fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8EAF6',
    fontSize: 16,
    color: '#072B66',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#3F51B5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  disabledButton: { opacity: 0.7 },
  errorText: {
    textAlign: 'center',
    color: '#D32F2F',
    marginBottom: 15,
    fontSize: 15,
  },
});
