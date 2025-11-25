import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserType() {
return (
    <View style={styles.container}>
    <Text style={styles.title}>¿Qué tipo de usuario eres?</Text>

    <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/App')}
    >
        <Text style={styles.buttonText}>Paciente</Text>
    </TouchableOpacity>

    <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/registrover2')}
    >
        <Text style={styles.buttonText}>Doctor</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => router.push('/Register')}>
        <Text style={styles.backText}>Volver</Text>
    </TouchableOpacity>
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
},

button: {
    width: '100%',
    height: 55,
    backgroundColor: '#4CAFED',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
},

buttonText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
},

backText: {
    marginTop: 15,
    color: '#4CAFED',
    fontSize: 16,
},
});
