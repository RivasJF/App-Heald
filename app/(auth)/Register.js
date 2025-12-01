import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Register() {

  const [date, setDate] = useState(null); 
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  // Formato DD/MM/AAAA
  const formatDate = (d) => {
    if (!d) return "DD/MM/AAAA";
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Registro de Usuario</Text>

      {/* NOMBRE */}
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="#999"
      />

      {/* TELÉFONO */}
      <TextInput
        style={styles.input}
        placeholder="Número de teléfono"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
      />

      {/* FECHA DE NACIMIENTO (DD/MM/AAAA) */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker(true)}
      >
        <Text style={{ fontSize: 16, color: date ? '#000' : '#999' }}>
          {formatDate(date)}
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
        placeholderTextColor="#999"
        keyboardType="email-address"
      />

      {/* CONTRASEÑA */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
      />

      {/* CONFIRMAR CONTRASEÑA */}
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        placeholderTextColor="#999"
        secureTextEntry
      />

      {/* CONTINUAR */}
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => router.push('/user')}
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
