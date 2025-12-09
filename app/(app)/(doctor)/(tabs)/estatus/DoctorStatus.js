import { Stack, Link, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../../src/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getDoctorByUserId } from '../../../../../src/services/doctorService';
import { updateDoctorStatus } from '../../../../../src/services/statusService';

export default function DoctorStatusScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);

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
      Alert.alert("Error", "No se pudo actualizar el estado. Inténtalo de nuevo.");
    }
  };

  const handleEmergencyClose = () => {
    Alert.alert(
      "Confirmar Cierre de Emergencia",
      "¿Estás seguro de que quieres cancelar todas tus citas por el resto del día?",
      [
        { text: "No", style: "cancel" },
        { text: "Sí, cerrar ahora", style: "destructive", onPress: () => {
          // Aquí iría la lógica para llamar a un endpoint de cierre de emergencia
          Alert.alert("Consultorio Cerrado", "Tus citas de hoy han sido canceladas.");
        }}
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
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Panel de Control</Text>

      <ScrollView>
        {/* 1. Control General */}
        <View style={styles.card}>
          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.switchLabel}>Servicio en Línea</Text>
              <Text style={styles.switchSubLabel}>
                {isActive ? 'Estás aceptando citas' : 'No estás aceptando citas'}
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#CFD8DC', true: '#81C784' }}
              thumbColor={"#FFFFFF"}
              value={isActive}
              onValueChange={handleStatusChange}
            />
          </View>
        </View>

        {/* 2. Menú de Configuración */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <TouchableOpacity style={styles.menuButton}>
                <FontAwesome name={item.icon} size={22} color="#3F51B5" style={styles.icon} />
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuButtonText}>{item.label}</Text>
                  <Text style={styles.menuButtonDescription}>{item.description}</Text>
                </View>
                <FontAwesome name="angle-right" size={24} color="#B0C4DE" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* 3. Acciones de Emergencia */}
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyClose}>
          <FontAwesome name="warning" size={20} color="#FFFFFF" />
          <Text style={styles.emergencyButtonText}>Cerrar por Emergencia Hoy</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F8FF' },
  title: { fontSize: 28, fontWeight: '800', color: '#072B66', marginBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
  },
  switchLabel: { fontSize: 16, fontWeight: "700", color: '#072B66' },
  switchSubLabel: { fontSize: 13, color: '#6B82B1', marginTop: 2 },
  menuContainer: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#072B66',
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
    borderBottomColor: '#F0F4F8',
  },
  icon: { width: 30, textAlign: 'center' },
  menuTextContainer: { flex: 1, marginLeft: 15 },
  menuButtonText: { fontSize: 16, color: '#072B66', fontWeight: '600' },
  menuButtonDescription: { fontSize: 12, color: '#7A93C7', marginTop: 2 },
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
});
