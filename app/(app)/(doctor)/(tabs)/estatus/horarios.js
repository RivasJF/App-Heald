import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert, Switch, Platform, TextInput } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../../src/context/AuthContext";
import { getScheduleByUserId, updateSchedule, createSchedule } from "../../../../../src/services/scheduleService";
import { getDoctorByUserId } from "../../../../../src/services/doctorService";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';

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

const FULL_NAME_TO_API_DAY = {
  Lunes: "MON",
  Martes: "TUE",
  Miércoles: "WED",
  Jueves: "THU",
  Viernes: "FRI",
  Sábado: "SAT",
  Domingo: "SUN",
};

const ALL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const initialScheduleState = ALL_DAYS.reduce((acc, day) => {
  acc[day] = {
    active: false,
    startTime: '09:00',
    endTime: '17:00',
    breakStartTime: '13:00',
    breakEndTime: '14:00',
  };
  return acc;
}, {});

// Colores:
const ACCENT_COLOR = "#3F51B5"; // Azul índigo
const ACTIVE_BG_COLOR = "#E8EAF6";
const INACTIVE_BG_COLOR = "#F5F5F5";
const TEXT_DARK = "#212121";
const TEXT_MUTED = "#757575";

export default function Horarios() {
  const router = useRouter();
  const { user } = useAuth();

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [consultationTime, setConsultationTime] = useState('30');
  const [scheduleExists, setScheduleExists] = useState(true); // Para saber si crear o actualizar
  // Estado para el selector de hora
  const [pickerVisible, setPickerVisible] = useState(false);
  const [timeBeingEdited, setTimeBeingEdited] = useState({ day: null, type: null });
  const [pickerDate, setPickerDate] = useState(new Date());

  const [scheduleConfig, setScheduleConfig] = useState(initialScheduleState);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      // 1. Obtener el perfil del doctor para conseguir el ID de DOCTOR
      getDoctorByUserId(user.id)
        .then(doctorProfile => {
          if (!doctorProfile?.id) {
            throw new Error("Perfil de doctor no encontrado.");
          }
          setDoctorProfile(doctorProfile);
          // 2. Usar el ID de DOCTOR para obtener el horario
          return getScheduleByUserId(doctorProfile.id);
        })
        .then(schedule => {
          if (schedule && schedule.days) {
            const newConfig = { ...initialScheduleState };
            schedule.days.forEach(day => {
              const dayName = API_DAY_TO_FULL_NAME[day.day];
              if (dayName) {
                newConfig[dayName].active = true;
                newConfig[dayName].startTime = day.startTime;
                newConfig[dayName].endTime = day.endTime;
              }
            });
            // Aquí se podrían procesar los breaks de manera similar
            setScheduleConfig(newConfig);
            setConsultationTime(String(schedule.consultationTime));
            setScheduleExists(true);
          }
          setError(null);
        })
        .catch(err => {
          // Si el horario no se encuentra (404), preparamos la UI para crear uno nuevo.
          if (err?.statusCode === 404) {
            setScheduleExists(false);
            setConsultationTime('30'); // Valor por defecto al crear
            setError(null); // No es un error, es un flujo normal.
          } else {
            console.error("Error al cargar el horario:", err);
            setError("No se pudo cargar el horario.");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleDayToggle = (day, value) => {
    setScheduleConfig(prev => ({
      ...prev,
      [day]: { ...prev[day], active: value }
    }));
  };

  const showTimePicker = (day, type, currentTime) => {
    const [hours, minutes] = currentTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    setPickerDate(date);
    setTimeBeingEdited({ day, type });
    setPickerVisible(true);
  };

  const onTimeChange = (event, selectedDate) => {
    // Ocultar el picker en Android. En iOS se oculta solo.
    if (Platform.OS === 'android') {
      setPickerVisible(false);
    }

    if (event.type === 'set' && selectedDate) {
      // Formatear a HH:mm
      const newTime = selectedDate.toTimeString().substring(0, 5);
      const { day, type } = timeBeingEdited;

      setScheduleConfig(prev => ({
        ...prev,
        [day]: { ...prev[day], [type]: newTime }
      }));
    }
  };

  const handleGuardarCambios = async () => {
    if (!doctorProfile?.id) {
      Alert.alert("Error", "No se pudo identificar al doctor.");
      return;
    }
    setIsSaving(true);

    const scheduleDto = {
      consultationTime: parseInt(consultationTime, 10) || 30,
      days: [],
      breaks: [],
    };

    for (const dayName in scheduleConfig) {
      const config = scheduleConfig[dayName];
      if (config.active) {
        const apiDay = FULL_NAME_TO_API_DAY[dayName];
        scheduleDto.days.push({
          day: apiDay,
          startTime: config.startTime,
          endTime: config.endTime,
        });
        scheduleDto.breaks.push({
          day: apiDay,
          startTime: config.breakStartTime,
          endTime: config.breakEndTime,
        });
      }
    }

    try {
      if (scheduleExists) {
        // Si el horario ya existe, lo actualizamos (PATCH)
        // Creamos una copia del DTO y eliminamos consultationTime para la actualización
        const { consultationTime, ...updateDto } = scheduleDto;
        await updateSchedule(doctorProfile.id, updateDto);
      } else {
        // Si no existe, lo creamos
        await createSchedule(doctorProfile.id, scheduleDto);
        setScheduleExists(true); // Después de crear, ya existe para futuras ediciones
      }
      Alert.alert("Éxito", "Tu horario ha sido actualizado correctamente.");
    } catch (err) {
      console.error("Error al guardar el horario:", err);
      Alert.alert("Error", "No se pudo guardar el horario. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Cabecera */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Panel de Control</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Mi Horario de Atención</Text>
      <View style={styles.separator} />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Tiempo de Consulta */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tiempo de Consulta (minutos)</Text>
        {scheduleExists ? (
          <Text style={styles.readOnlyText}>{consultationTime}</Text>
        ) : (
          <TextInput
            style={styles.input}
            value={consultationTime}
            onChangeText={setConsultationTime}
            keyboardType="numeric"
            placeholder="Ej: 30"
          />
        )}
      </View>
      <View style={styles.separator} />

      {ALL_DAYS.map(day => {
        const config = scheduleConfig[day];
        return (
          <View key={day} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{day}</Text>
              <Switch
                trackColor={{ false: INACTIVE_BG_COLOR, true: ACCENT_COLOR }}
                thumbColor={"#fff"}
                value={config.active}
                onValueChange={(value) => handleDayToggle(day, value)}
              />
            </View>
            {config.active && (
              <View style={styles.detailsContainer}>
                {/* Horario de Trabajo */}
                <View style={styles.timeRow}>
                  <FontAwesome name="clock-o" size={16} color={TEXT_DARK} style={styles.timeIcon} />
                  <Text style={styles.timeLabel}>Trabajo:</Text>
                  <TouchableOpacity onPress={() => showTimePicker(day, 'startTime', config.startTime)}>
                    <Text style={styles.timeValue}>{config.startTime}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeSeparator}>-</Text>
                  <TouchableOpacity onPress={() => showTimePicker(day, 'endTime', config.endTime)}>
                    <Text style={styles.timeValue}>{config.endTime}</Text>
                  </TouchableOpacity>
                </View>
                {/* Horario de Descanso */}
                <View style={styles.timeRow}>
                  <FontAwesome name="coffee" size={16} color={TEXT_MUTED} style={styles.timeIcon} />
                  <Text style={styles.timeLabel}>Descanso:</Text>
                  <TouchableOpacity onPress={() => showTimePicker(day, 'breakStartTime', config.breakStartTime)}>
                    <Text style={styles.timeValue}>{config.breakStartTime}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeSeparator}>-</Text>
                  <TouchableOpacity onPress={() => showTimePicker(day, 'breakEndTime', config.breakEndTime)}>
                    <Text style={styles.timeValue}>{config.breakEndTime}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );
      })}

      {pickerVisible && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}

      <TouchableOpacity style={styles.confirmButton} onPress={handleGuardarCambios} disabled={isSaving}>
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmButtonText}>Guardar Horarios</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contentContainer: { paddingHorizontal: 20, paddingVertical: 40, paddingBottom: 100 },
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
  separator: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 25 },
  input: {
    backgroundColor: INACTIVE_BG_COLOR,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: TEXT_DARK,
  },
  readOnlyText: {
    fontSize: 16,
    color: TEXT_MUTED,
    padding: 12,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 15,
    paddingTop: 15,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeIcon: {
    width: 20,
  },
  timeLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: TEXT_DARK,
    width: 70, // Ancho fijo para alinear los horarios
  },
  timeValue: {
    color: ACCENT_COLOR,
    fontWeight: '600',
    fontSize: 15,
    textDecorationLine: 'underline',
    paddingHorizontal: 5,
  },
  timeSeparator: {
    fontSize: 15,
    color: TEXT_DARK,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: ACCENT_COLOR,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 40,
    elevation: 3,
  },
  errorText: {
    textAlign: 'center',
    color: '#D32F2F',
    marginBottom: 15,
    fontSize: 15,
  },
  confirmButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});