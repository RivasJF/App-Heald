import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Register() {

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [date, setDate] = useState(null); 
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  // Formato para mostrar en la UI: DD/MM/AAAA
  const formatDisplayDate = (d) => {
    if (!d) return "DD/MM/AAAA";
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Formato para enviar a la API: YYYY-MM-DDTHH:mm:ss.sssZ
  const formatApiDate = (d) => {
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear(); 
    return `${year}-${month}-${day}`;
  };

  const handleRegister = () => {
    // 1. Validación de campos vacíos
    if (!nombre || !telefono || !email || !password || !confirmPassword || !date) {
      Alert.alert('Campos Incompletos', 'Por favor, rellena todos los campos.');
      return;
    }

    // 2. Validación de la contraseña
    if (password.length < 8) {
      Alert.alert('Contraseña Inválida', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error de Contraseña', 'Las contraseñas no coinciden.');
      return;
    }

    // 3. Formateo del número de teléfono
    const cleanedPhone = telefono.replace(/\s+/g, ''); // Elimina espacios
    const formattedTelefono = cleanedPhone.startsWith('+52') ? cleanedPhone : `+52${cleanedPhone}`;
    if (formattedTelefono.length !== 13) { // +52 y 10 dígitos
        Alert.alert('Teléfono Inválido', 'El número de teléfono debe contener 10 dígitos.');
        return;
    }

    // Si todas las validaciones pasan, continuamos
    router.push({
      pathname: '/user',
      params: {
        nombre,
        telefono: formattedTelefono,
        fechaNacimiento: formatApiDate(date),
        email,
        password, // Nota: En una app real, evita pasar contraseñas así.
      },
    });
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Registro de Usuario</Text>

      {/* NOMBRE */}
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
        placeholderTextColor="#999"
      />

      {/* TELÉFONO */}
      <TextInput
        style={styles.input}
        placeholder="Número de teléfono"
        value={telefono}
        onChangeText={setTelefono}
        placeholderTextColor="#999"
        keyboardType="phone-pad"
      />

      {/* FECHA DE NACIMIENTO (DD/MM/AAAA) */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker(true)}
      >
        <Text style={{ fontSize: 16, color: date ? '#000' : '#999' }}>
          {formatDisplayDate(date)}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date || new Date(2000, 0, 1)}
          mode="date"
          display="spinner"   // ← más parecido a ruleta
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* CORREO */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#999"
        keyboardType="email-address"
      />

      {/* CONTRASEÑA */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#999"
        secureTextEntry
      />

      {/* CONFIRMAR CONTRASEÑA */}
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor="#999"
        secureTextEntry
      />

      {/* CONTINUAR */}
      <TouchableOpacity
        style={styles.buttonPrimary} 
        onPress={handleRegister}
      >
        <Text style={styles.buttonPrimaryText}>Continuar</Text>
      </TouchableOpacity>

      {/* VOLVER */}
      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.backToLogin}>Volver al inicio</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
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

  backToLogin: {
    color: '#4CAFED',
    fontSize: 16,
    marginTop: 20,
  },
});
