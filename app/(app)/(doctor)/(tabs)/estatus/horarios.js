import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../../src/context/AuthContext";
import { getScheduleByUserId } from "../../../../../src/services/scheduleService";
import { getDoctorByUserId } from "../../../../../src/services/doctorService";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";

// Mapeo: Abreviatura (para el botón) -> Nombre completo (para el estado de datos)
const DIAS_MAP = {
  Lun: "Lunes",
  Mar: "Martes",
  Mié: "Miércoles",
  Jue: "Jueves",
  Vie: "Viernes",
  Sáb: "Sábado",
  Dom: "Domingo",
};

// Mapeo inverso para procesar la respuesta de la API
const API_DAY_TO_FULL_NAME = {
  MON: "Lunes",
  TUE: "Martes",
  WED: "Miércoles",
  THU: "Jueves",
  FRI: "Viernes",
  SAT: "Sábado",
  SUN: "Domingo",
};

// Colores:
const ACCENT_COLOR = "#3F51B5"; // Azul índigo
const TEXT_DARK = "#212121";

export default function Horarios() {
  const router = useRouter();
  const { user } = useAuth();

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      // 1. Obtener el perfil del doctor para conseguir el ID de DOCTOR
      getDoctorByUserId(user.id)
        .then(doctorProfile => {
          if (!doctorProfile?.id) {
            throw new Error("Perfil de doctor no encontrado.");
          }
          // 2. Usar el ID de DOCTOR para obtener el horario
          return getScheduleByUserId(doctorProfile.id);
        })
        .then(schedule => {
          if (schedule && schedule.days) {
            setSchedule(schedule);
          }
          setError(null);
        })
        .catch(err => {
          console.error("Error al cargar el horario:", err);
          setError("No se pudo cargar el horario.");
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const renderScheduleItem = ({ item: day }) => {
    const breakTime = schedule.breaks.find(b => b.day === day.day);
    return (
      <View style={styles.dayCard}>
        <Text style={styles.dayTitle}>{API_DAY_TO_FULL_NAME[day.day]}</Text>
        <View style={styles.detailRow}>
          <FontAwesome name="clock-o" size={16} color={ACCENT_COLOR} />
          <Text style={styles.detailText}>{day.startTime} - {day.endTime}</Text>
        </View>
        {breakTime && (
          <View style={styles.detailRow}>
            <FontAwesome name="coffee" size={16} color="#757575" />
            <Text style={styles.detailText}>Descanso: {breakTime.startTime} - {breakTime.endTime}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
        <Text style={{ marginTop: 10 }}>Cargando horario...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Cabecera */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Panel de Control</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Mi Horario de Atención</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {schedule ? (
        <>
          <View style={styles.summaryCard}>
            <FontAwesome name="hourglass-half" size={20} color={ACCENT_COLOR} />
            <Text style={styles.summaryText}>
              Tiempo de consulta: <Text style={{ fontWeight: 'bold' }}>{schedule.consultationTime} minutos</Text>
            </Text>
          </View>

          <FlatList
            data={schedule.days}
            renderItem={renderScheduleItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 10 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay días de trabajo configurados.</Text>}
          />
        </>
      ) : (
        !loading && <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontró un horario configurado.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F8FF", padding: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#F5F8FF" },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Cabecera */
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: { color: ACCENT_COLOR, fontSize: 16, fontWeight: "700" },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 15,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  summaryText: {
    marginLeft: 15,
    fontSize: 16,
    color: TEXT_DARK,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 15,
    color: TEXT_DARK,
  },
  errorText: {
    textAlign: 'center',
    color: '#D32F2F',
    marginBottom: 15,
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 50,
    fontSize: 16,
  },
});