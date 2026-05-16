import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registerUser } from '../../src/services/userServices';
import { useRegisterStore } from '../../src/store/register.store';

export default function Register() {
  // Zustand store
  const { name, email, telefono, password, confirmPassword, birthDate, role, setName, setEmail, setTelefono, setPassword, setConfirmPassword, setBirthDate, reset } = useRegisterStore();
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState(null); 
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const day = selectedDate.getDate().toString().padStart(2, "0");
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = selectedDate.getFullYear();
      setBirthDate(`${year}-${month}-${day}`);
    }
  };

  // Formato para mostrar en la UI: DD/MM/AAAA
  const formatDisplayDate = (d) => {
    if (!d) return "DD/MM/AAAA";
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const handleRegister = async () => {
    // 1. Validación de campos vacíos
    if (!name || !telefono || !email || !password || !confirmPassword || !date) {
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

    // 3. Validación de rol
    if (!role) {
      Alert.alert('Rol no seleccionado', 'Por favor, vuelve atrás y selecciona tu tipo de usuario.');
      return;
    }

    // 4. Formateo del número de teléfono
    const cleanedPhone = telefono.replace(/\s+/g, ''); // Elimina espacios
    const formattedTelefono = cleanedPhone.startsWith('+52') ? cleanedPhone : `+52${cleanedPhone}`;
    if (formattedTelefono.length !== 13) { // +52 y 10 dígitos
        Alert.alert('Teléfono Inválido', 'El número de teléfono debe contener 10 dígitos.');
        return;
    }

    // Construir objeto de datos para la API
    const userData = {
      name,
      email,
      password,
      phoneNumber: formattedTelefono,
      birthDate,
      role, // El rol fue guardado en user.js
    };

    console.log("Enviando datos a la API:", userData);

    // Si todas las validaciones pasan, enviamos a la API
    setLoading(true);
    try {
      await registerUser(userData);
      Alert.alert(
        "Registro Exitoso",
        "Tu cuenta ha sido creada. Ahora puedes iniciar sesión."
      );
      // Resetear store después del registro exitoso
      reset();
      // Navegar a login
      router.push("/login");
    } catch (error) {
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      Alert.alert("Error de Registro", errorMessage);
      console.error("Detalles del error de registro:", error);
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
        <Text style={styles.welcomeText}>Registro de</Text>{"\n"}
        <Text style={styles.brandText}>Usuario</Text>
      </Text>

      {/* NOMBRE */}
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
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
        disabled={loading}
      >
        <Text style={styles.buttonPrimaryText}>{loading ? "Registrando..." : "Registrarse"}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#4CAFED" />}

      {/* VOLVER */}
      <TouchableOpacity onPress={() => router.push('/user')} disabled={loading}>
        <Text style={styles.backToLogin}>Volver a seleccionar rol</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Capa consistente con login y user
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  title: {
    textAlign: 'center',
    marginBottom: 30,
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

  input: {
    width: '95%',
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

  backToLogin: {
    color: '#4CAFED',
    fontSize: 16,
    marginTop: 20,
  },
});
