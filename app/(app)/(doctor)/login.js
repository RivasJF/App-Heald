import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ActivityIndicator } from 'react-native';

// ⚠️ Asegúrate de que la ruta de importación sea correcta
import { loginUser } from '../../../src/services/authService'; 

export default function LoginScreen() {
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
      console.log('Intentando iniciar sesión para:', email);
      
      const loginResponse = await loginUser(email, password);
      
      // Manejo de éxito
      const token = loginResponse.access_token;
      const user = loginResponse.user;
      
      Alert.alert('¡Login Exitoso!', `Bienvenido, ${user.email}. Tu token ha sido recibido.`);
      
      // Aquí deberías guardar el 'token' y los datos del 'user' 
      // usando AsyncStorage o un contexto global para la sesión.
      console.log('Token recibido:', token.substring(0, 30) + '...'); 
      
    } catch (error) {
      // Manejo de error específico (ej: "Password incorrect")
      const errorMessage = error.message || 'Error desconocido en el servidor.';
      Alert.alert('Error de Login', errorMessage);
      console.error('Detalles del error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔒 Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={loading ? "Conectando..." : "Entrar"}
        onPress={handleLogin}
        disabled={loading}
        color="#007bff"
      />
      
      {loading && <ActivityIndicator style={{marginTop: 15}} size="small" color="#007bff" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
});