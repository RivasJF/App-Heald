import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Link, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { useTheme } from '../../../../../src/context/ThemeContext';
import { getDoctorByUserId } from '../../../../../src/services/doctorService';
import { setDailyClosure, setDayOff, updateDoctorStatus } from '../../../../../src/services/statusService';

export default function DoctorStatusScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isEmergencyPickerVisible, setIsEmergencyPickerVisible] = useState(false);
  const [isDayOffPickerVisible, setIsDayOffPickerVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Cargar el perfil del doctor para obtener el estado inicial
  useEffect(() => {
    if (user?.id) {
      getDoctorByUserId(user.id)
        .then(profile => {
          setDoctorProfile(profile);
          setIsActive(profile?.serviceStatus?.active || false);
        })
        .catch(err => console.error("Failed to load doctor profile for status", err));
    }
  }, [user]);

  const handleStatusChange = async (newStatus) => {
    if (!doctorProfile?.id) return;

    try {
      await updateDoctorStatus(doctorProfile.id, newStatus);
      setIsActive(newStatus); // Actualiza la UI solo si la API responde correctamente
      Alert.alert("Estado Actualizado", `Tu servicio ahora está ${newStatus ? 'activo' : 'inactivo'}.`);
    } catch (error) {
      const errorMessage = error?.message || "No se pudo actualizar el estado. Inténtalo de nuevo.";
      Alert.alert("Error", errorMessage);
    }
  };

  const triggerDailyClosure = async (closureTime) => {
    if (!doctorProfile?.id) {
      Alert.alert("Error", "No se pudo identificar al doctor.");
      return;
    }
    setIsClosing(true);
    try {
      const today = new Date();
      const closureDto = {
        date: today.toISOString().split('T')[0], // Formato YYYY-MM-DD
        closedAt: closureTime, // Formato HH:mm
      };
      await setDailyClosure(doctorProfile.id, closureDto);
      Alert.alert(
        "Cierre Confirmado",
        `El consultorio se cerrará a partir de las ${closureTime}. Se cancelarán las citas restantes.`
      );
    } catch (error) {
      const errorMessage = error?.message || "No se pudo programar el cierre. Inténtalo de nuevo.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsClosing(false);
    }
  };

  const onDayOffChange = async (event, selectedDate) => {
    setIsDayOffPickerVisible(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      if (!doctorProfile?.id) {
        Alert.alert("Error", "No se pudo identificar al doctor.");
        return;
      }
      // Formatear la fecha manualmente para evitar problemas de zona horaria.
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      
      const date = `${year}-${month}-${day}`; // Formato YYYY-MM-DD

      try {
        await setDayOff(doctorProfile.id, { date });
        Alert.alert(
          "Día Libre Confirmado",
          `El día ${date} ha sido marcado como no laborable. Todas las citas para esta fecha serán canceladas.`
        );
      } catch (error) {
        const errorMessage = error?.message || "No se pudo marcar el día libre.";
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const onEmergencyTimeChange = (event, selectedDate) => {
    setIsEmergencyPickerVisible(Platform.OS === 'ios'); // En iOS el picker es un modal
    if (event.type === 'set' && selectedDate) {
      const formattedTime = selectedDate.toTimeString().substring(0, 5); // Formato HH:mm
      triggerDailyClosure(formattedTime);
    }
  };

  const handleEmergencyClose = () => {
    Alert.alert(
      "Confirmar Cierre de Emergencia",
      "¿A partir de qué momento deseas cerrar el consultorio por hoy?",
      [
        {
          text: "Cerrar ahora mismo",
          style: "destructive",
          onPress: () => {
            const now = new Date();
            const currentTime = now.toTimeString().substring(0, 5); // Formato HH:mm
            triggerDailyClosure(currentTime);
          }
        },
        {
          text: "Elegir hora de cierre",
          onPress: () => setIsEmergencyPickerVisible(true)
        },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const menuItems = [
    {
      href: '/(app)/(doctor)/(tabs)/estatus/horarios',
      icon: 'calendar',
      label: 'Configurar Horario Semanal',
      description: 'Define tus días y bloques de atención.'
    },
    {
      href: '/(app)/(doctor)/(tabs)/estatus/consultorio',
      icon: 'hospital-o',
      label: 'Datos del Consultorio',
      description: 'Actualiza la dirección de tu clínica.'
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={[styles.title, { color: colors.text }]}>Panel de Control</Text>

      <ScrollView>
        {/* 1. Control General */}
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#072B66' }]}>
          <View style={styles.switchContainer}>
            <View>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Servicio en Línea</Text>
              <Text style={[styles.switchSubLabel, { color: colors.subtitle }]}>
                {isActive ? 'Estás aceptando citas' : 'No estás aceptando citas'}
              </Text>
            </View>
            <Switch
              trackColor={{ false: isDarkMode ? '#2D3748' : '#CFD8DC', true: '#81C784' }}
              thumbColor={"#FFFFFF"}
              value={isActive}
              onValueChange={handleStatusChange}
            />
          </View>
        </View>

        {/* 2. Menú de Configuración */}
        <View style={[styles.menuContainer, { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#072B66' }]}>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <TouchableOpacity style={[styles.menuButton, { borderBottomColor: colors.border }]}>
                <FontAwesome name={item.icon} size={22} color={colors.primary} style={styles.icon} />
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuButtonText, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.menuButtonDescription, { color: colors.subtitle }]}>{item.description}</Text>
                </View>
                <FontAwesome name="angle-right" size={24} color={isDarkMode ? colors.subtitle : "#B0C4DE"} />
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Botón para marcar día libre */}
        <TouchableOpacity
          style={[styles.dayOffButton, { backgroundColor: isDarkMode ? colors.card : '#E8EAF6', borderColor: colors.border }]}
          onPress={() => setIsDayOffPickerVisible(true)}
        >
          <FontAwesome name="calendar-times-o" size={20} color={colors.primary} />
          <Text style={[styles.dayOffButtonText, { color: colors.primary }]}>Marcar Día No Laborable</Text>
        </TouchableOpacity>

        {/* 3. Acciones de Emergencia */}
        <TouchableOpacity style={[styles.emergencyButton, isClosing && styles.disabledButton]} onPress={handleEmergencyClose} disabled={isClosing}>
          <FontAwesome name="warning" size={20} color="#FFFFFF" />
          <Text style={styles.emergencyButtonText}>Cerrar por Emergencia Hoy</Text>
        </TouchableOpacity>

        {isEmergencyPickerVisible && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onEmergencyTimeChange}
          />
        )}

        {isDayOffPickerVisible && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={onDayOffChange}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20 , textAlign:'center'},
  card: {
    borderRadius: 12,
    padding: 20,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
  },
  switchLabel: { fontSize: 16, fontWeight: "700" },
  switchSubLabel: { fontSize: 13, marginTop: 2 },
  menuContainer: {
    marginTop: 24,
    borderRadius: 12,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  icon: { width: 30, textAlign: 'center' },
  menuTextContainer: { flex: 1, marginLeft: 15 },
  menuButtonText: { fontSize: 16, fontWeight: '600' },
  menuButtonDescription: { fontSize: 12, marginTop: 2 },
  emergencyButton: {
    marginTop: 30,
    backgroundColor: '#EF5350',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#D32F2F',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  dayOffButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  dayOffButtonText: {
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
});
