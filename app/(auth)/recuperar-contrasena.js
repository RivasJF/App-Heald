import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSendCodeResetPassword } from '../../src/hooks/user/useSendCodeResetPassword.hook';

export default function RecuperarContrasena() {
    const { mutateAsync: sendCode, isPending: loading } = useSendCodeResetPassword();
    const [email, setEmail] = useState('');

    const validateEmail = (value) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(value);
};

    const handleSendCode = async () => {
    if (!email) {
        Alert.alert('Email requerido', 'Por favor ingresa tu correo electrónico.');
        return;
    }

    if (!validateEmail(email)) {
        Alert.alert('Correo inválido', 'El correo es inválido, verifica y vuelve a intentarlo.');
        return;
    }

    try {
    await sendCode({ email });
    Alert.alert(
        'Código enviado',
        'Se ha enviado un código de verificación a tu correo.'
    );
    router.push({ pathname: '/ingresar-codigo', params: { email } });
    } catch (error) {
    const errorMessage = error.message || 'Error al enviar el código.';
    Alert.alert('Error', errorMessage);
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
        <Text style={styles.welcomeText}>Recupera tu</Text>
        {'\n'}
        <Text style={styles.brandText}>Contraseña</Text>
        </Text>

        <Text style={styles.description}>
        Ingresa tu correo electrónico asociado a tu cuenta para recuperar tu
        contraseña.
        </Text>

        <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#999"
        editable={!loading}
        />

        <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={handleSendCode}
        disabled={loading}
        >
        <Text style={styles.buttonPrimaryText}>
            {loading ? 'Enviando...' : 'Da click para continuar'}
        </Text>
        </TouchableOpacity>

        {loading && (
        <ActivityIndicator style={{ marginTop: 15 }} size="large" color="#4CAFED" />
        )}

        <Text style={styles.infoText}>
        Se enviará un código a tu correo y luego podrás ingresarlo en la siguiente pantalla.
        </Text>

        <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.backToLoginText}>Volver al Login</Text>
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

codeDescription: {
    fontSize: 13,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
    lineHeight: 18,
},

infoText: {
    fontSize: 13,
    color: '#555555',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
    lineHeight: 18,
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

changeEmailText: {
    color: '#0B4EF2',
    textDecorationLine: 'underline',
    marginTop: 15,
    fontSize: 14,
    fontWeight: '500',
},

backToLoginText: {
    color: '#0B4EF2',
    marginTop: 25,
    fontSize: 16,
},
});