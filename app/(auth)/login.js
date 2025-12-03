import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';


export default function App() {
  const { signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Por favor, introduce tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      const errorMessage = error.message || 'Error desconocido en el servidor.';
      Alert.alert('Error de Login', errorMessage);
      console.error('Detalles del error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Bienvenido a Health Medic!</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa Correo"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Ingresa Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin} disabled={loading || authLoading}>
        <Text style={styles.buttonPrimaryText}>{(loading || authLoading) ? "Conectando..." : "Continuar"}</Text>
      </TouchableOpacity>

      {(loading || authLoading) && <ActivityIndicator style={{marginTop: 15}} size="large" color="#4CAFED" />}

      <TouchableOpacity onPress={() => router.push('/Register')}>
        <Text style={styles.registerText}>Registrarte</Text>
      </TouchableOpacity>

      <Text style={styles.privacyText}>
        Al continuar ceptas los terminos y condiciones y la{' '}
        <Text style={styles.link}>Política de privacidad</Text>
      </Text>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },

  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  buttonPrimary: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAFED',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonPrimaryText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  registerText: {
    color: '#4CAFED',
    marginTop: 15,
    fontSize: 16,
  },

  privacyText: {
    color: '#444',
    textAlign: 'center',
    marginTop: 25,
    fontSize: 13,
  },

  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
