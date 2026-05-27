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
export default function IngresarCodigo() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);


    const handleVerifyCode = async () => {
    if (!code) {
        Alert.alert('Código requerido', 'Por favor ingresa el código que recibiste.');
        return;
    }

    if (code.length !== 6) {
        Alert.alert('Código inválido', 'El código debe tener 6 dígitos.');
        return;
    }

    setLoading(true);
    try {
      // Aquí va la lógica de verificación del código si se agrega en el futuro.
        Alert.alert('Código verificado', 'Ahora puedes continuar y cambiar tu contraseña.');
        router.push('/nueva-contrasena');
    } catch (error) {
        const errorMessage = error.message || 'Error al verificar el código.';
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
        <Text style={styles.welcomeText}>Ingrese su</Text>
        {'\n'}
        <Text style={styles.brandText}>Código de Recuperación</Text>
        </Text>

        <Text style={styles.description}>
        Revisa tu correo electrónico y localiza el mensaje con el código de 6 dígitos. Si no lo recibes, revisa la carpeta de spam o solicita un nuevo código. Ingresa el código a continuación.
        </Text>

        <View style={styles.codeInputWrapper}>
        <TextInput
            style={styles.codeInput}
            placeholder="000000"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            placeholderTextColor="#999"
            maxLength={6}
        />
        </View>

        <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={handleVerifyCode}
        disabled={loading}
        >
        <Text style={styles.buttonPrimaryText}>
            {loading ? 'Verificando...' : 'Continuar'}
        </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/recuperar-contrasena')}>
        <Text style={styles.backText}>Volver a enviar código</Text>
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
codeInputWrapper: {
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAFED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    paddingVertical: 8,
    marginBottom: 15,
},
codeInput: {
    width: '90%',
    height: 60,
    borderWidth: 0,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 14,
    color: '#072B66',
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
