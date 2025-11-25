import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Bienvenido a CITA CLICK!</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu correo"
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu contraseña"
        placeholderTextColor="#999"
        secureTextEntry
      />

      <TouchableOpacity style={styles.buttonPrimary}>
        <Text style={styles.buttonPrimaryText}>Continuar</Text>
      </TouchableOpacity>

      {/* NAVEGA A LA PANTALLA DE TIPOS DE USUARIO */}
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
