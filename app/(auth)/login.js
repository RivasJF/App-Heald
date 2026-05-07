import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
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
    <ImageBackground
      source={require('../../assets/fondo.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>

      <Image
        source={require('../../assets/adaptive-icon.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>
        <Text style={styles.welcomeText}>Bienvenido a</Text>{"\n"}
        <Text style={styles.brandText}>Health Medic!</Text>
      </Text>

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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Capa blanca semi-transparente para resaltar el marmolado con elegancia
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  logo: {
    width: 150,
    height: 150,
    borderRadius: 75, // Esto lo hace circular
    marginBottom: 20,
  },

  title: {
    textAlign: 'center',
    marginBottom: 30,
  },

  welcomeText: {
    fontSize: 22, // Reducido de 28 para un mejor balance
    fontWeight: '400', // Peso normal (sin negritas)
    color: '#666666', // Tono grisáceo para resaltar más la marca
    lineHeight: 28,
  },

  brandText: {
    fontSize: 36, // Reducido de 42 para evitar desbordamientos en pantallas pequeñas
    fontWeight: '900', // El peso más fuerte disponible
    color: '#072B66', // Azul de la marca
    lineHeight: 42,
    letterSpacing: -1, // Un toque moderno para que resalte más
  },

  input: {
    width: '95%',
    height: 50,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF', // Ahora es blanco para integrarse totalmente
    marginBottom: 15,
    fontSize: 16,
  },

  buttonPrimary: {
    width: '95%',
    height: 50,
    backgroundColor: '#4CAFED', // Azul claro consistente con el resto de la app
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
    color: '#0B4EF2',
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
