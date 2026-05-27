import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function NuevaContrasena() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSavePassword = async () => {
    if (!password || !confirmPassword) {
        Alert.alert('Campos incompletos', 'Por favor completa ambos campos.');
return;
    }

    if (password.length < 8) {
        Alert.alert('Contraseña corta', 'La contraseña debe tener al menos 8 caracteres.');
return;
    }

    if (password !== confirmPassword) {
        Alert.alert('No coinciden', 'Las contraseñas no coinciden.');
return;
    }

    setLoading(true);
    try {
      // Aquí se puede agregar la llamada al backend para cambiar la contraseña.
    Alert.alert('Contraseña actualizada', 'Tu nueva contraseña ha sido guardada.');
    router.replace('/login');
    } catch (error) {
    const errorMessage = error.message || 'Error al guardar la contraseña.';
    Alert.alert('Error', errorMessage);
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
        <Text style={styles.title}>
        <Text style={styles.welcomeText}>Nueva</Text>
        {'\n'}
        <Text style={styles.brandText}>Contraseña</Text>
        </Text>

        <Text style={styles.description}>
        Ingresa una nueva contraseña segura y confírmala para restablecer el acceso a tu cuenta.{"\n"}
        La contraseña debe tener al menos 8 caracteres. Para mayor seguridad, utiliza una combinación de
        mayúsculas, minúsculas, números y símbolos, y evita palabras o secuencias fáciles de adivinar.
        </Text>

        <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#999"
        />

        <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor="#999"
        />

        <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={handleSavePassword}
        disabled={loading}
        >
        <Text style={styles.buttonPrimaryText}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
        </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.backText}>Volver al Login</Text>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
},
title: {
    textAlign: 'center',
    marginBottom: 20,
},
welcomeText: {
    fontSize: 22,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 28,
},
brandText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#072B66',
    lineHeight: 42,
    letterSpacing: -1,
},
description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
    lineHeight: 20,
},
input: {
    width: '95%',
    height: 50,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
},
buttonPrimary: {
    width: '95%',
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
backText: {
    color: '#0B4EF2',
    marginTop: 20,
    fontSize: 15,
},
});