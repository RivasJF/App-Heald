import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Alert,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function VerificacionAutenticidad() {
    const registrationData = useLocalSearchParams();
    const [codigo, setCodigo] = useState('');
    const [intentos, setIntentos] = useState(3);
    const CODIGO_CORRECTO = "123456"; // Código de ejemplo (esto vendría de tu backend)

    const handleVerificar = () => {
        if (!codigo) {
            Alert.alert("Campo vacío", "Por favor ingresa el código enviado a tu correo.");
            return;
        }

        if (codigo === CODIGO_CORRECTO) {
            Alert.alert("Éxito", "Identidad verificada correctamente.");
            // Redirigimos a la pantalla de selección de usuario pasando los datos originales
            router.push({
                pathname: '/user',
                params: registrationData
            });
        } else {
            const nuevosIntentos = intentos - 1;
            setIntentos(nuevosIntentos);
            
            if (nuevosIntentos > 0) {
                Alert.alert("Código Incorrecto", `Te quedan ${nuevosIntentos} intentos.`);
            } else {
                Alert.alert("Sin intentos", "Has agotado tus intentos. Por favor, solicita un nuevo código.");
                setCodigo('');
            }
        }
    };

    const handleReenviar = () => {
        setIntentos(3);
        setCodigo('');
        Alert.alert("Código Enviado", `Se ha enviado un nuevo código a: ${registrationData.email}`);
    };

    return (
        <ImageBackground
            source={require('../../assets/fondo.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Text style={styles.title}>
                    <Text style={styles.welcomeText}>Verificación de</Text>{"\n"}
                    <Text style={styles.brandText}>Autenticidad</Text>
                </Text>

                <Text style={styles.subtitle}>
                    Verificación de Identidad Requerida: Se ha generado un código de seguridad único de 6 dígitos para la cuenta vinculada a{' '}
                    <Text style={{ fontWeight: '700', color: '#072B66' }}>{registrationData.email}</Text>.
                    {"\n\n"}
                    Por favor, introduzca el código recibido para verificar su autenticidad y proceder a la siguiente pantalla.
                </Text>

                <TextInput
                    style={[styles.input, intentos === 0 && styles.inputDisabled]}
                    placeholder="000000"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={codigo}
                    onChangeText={setCodigo}
                    editable={intentos > 0}
                />

                <Text style={[styles.attemptsText, intentos <= 1 && {color: '#D32F2F'}]}>
                    Intentos restantes: {intentos}
                </Text>

                <TouchableOpacity 
                    style={[styles.buttonPrimary, intentos === 0 && styles.buttonDisabled]} 
                    onPress={handleVerificar}
                    disabled={intentos === 0}
                >
                    <Text style={styles.buttonText}>Continuar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonSecondary} onPress={handleReenviar}>
                    <Text style={styles.buttonSecondaryText}>Reenviar Código</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backLink}>Corregir correo</Text>
                </TouchableOpacity>

                <StatusBar style="auto" />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1 },
    container: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: { textAlign: 'center', marginBottom: 20 },
    welcomeText: { fontSize: 22, fontWeight: '400', color: '#666666' },
    brandText: { fontSize: 32, fontWeight: '900', color: '#072B66', letterSpacing: -1 },
    subtitle: {
        textAlign: 'center',
        fontSize: 15,
        color: '#444',
        marginBottom: 30,
        lineHeight: 22,
    },
    input: {
        width: '80%',
        height: 60,
        borderWidth: 2,
        borderColor: '#4CAFED',
        borderRadius: 15,
        backgroundColor: '#FFF',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 5,
        color: '#072B66',
        marginBottom: 10,
    },
    inputDisabled: { borderColor: '#CCC', backgroundColor: '#F5F5F5' },
    attemptsText: { fontSize: 13, color: '#666', marginBottom: 30, fontWeight: '600' },
    buttonPrimary: {
        width: '95%',
        height: 55,
        backgroundColor: '#4CAFED',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonDisabled: { backgroundColor: '#B0C4DE' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    buttonSecondary: {
        width: '95%',
        height: 55,
        borderWidth: 1.5,
        borderColor: '#4CAFED',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonSecondaryText: { color: '#4CAFED', fontSize: 16, fontWeight: '700' },
    backLink: { color: '#666', marginTop: 25, textDecorationLine: 'underline' },
});