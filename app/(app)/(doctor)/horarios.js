import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";

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

const DIAS_ABREVIADOS = Object.keys(DIAS_MAP);

// Días de Lunes a Viernes
const DIAS_SEMANA_LUN_VIE = DIAS_ABREVIADOS.slice(0, 5); 
// Días de Sábado y Domingo
const DIAS_FIN_SEMANA = DIAS_ABREVIADOS.slice(5); 

// Colores:
const ACCENT_COLOR = "#3F51B5"; // Azul índigo
const ACTIVE_BG_COLOR = "#E8EAF6";
const INACTIVE_BG_COLOR = "#F5F5F5";
const TEXT_DARK = "#212121";
const TEXT_MUTED = "#757575";

export default function Horarios() {
  const router = useRouter();

  const [clinicaActiva, setClinicaActiva] = useState(true);
  
  // Estado que guarda los NOMBRES COMPLETOS de los días abiertos
  const [diasAbiertos, setDiasAbiertos] = useState(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]); 

  const [horaSeleccionada, setHoraSeleccionada] = useState("9:00 AM - 6:00 PM");

  const bloquesHorarios = [
    "9:00 AM - 6:00 PM",
    "8:00 AM - 5:00 PM",
    "10:00 AM - 7:00 PM",
    "Mañana (8-12 PM)",
    "Tarde (2-6 PM)",
  ];

  // Función de toggle
  const toggleDiaAbierto = (abreviatura) => {
    const diaCompleto = DIAS_MAP[abreviatura]; 

    setDiasAbiertos((prevDias) => {
      if (prevDias.includes(diaCompleto)) {
        return prevDias.filter((d) => d !== diaCompleto);
      } else {
        return [...prevDias, diaCompleto];
      }
    });
  };
  
  // Renderiza un día individual (función auxiliar para no repetir código)
  const renderDiaButton = (abreviatura) => {
    const diaCompleto = DIAS_MAP[abreviatura];
    const esAbierto = diasAbiertos.includes(diaCompleto); 
    return (
      <TouchableOpacity
        key={abreviatura}
        style={[
          styles.diaButton,
          esAbierto ? styles.diaButtonOpen : styles.diaButtonClosed
        ]}
        onPress={() => toggleDiaAbierto(abreviatura)}
      >
        <Text style={[styles.diaText, esAbierto ? styles.diaTextOpen : styles.diaTextClosed]}>
          {abreviatura}
        </Text>
      </TouchableOpacity>
    );
  };

  const confirmarCambios = () => {
    const resumen = `Configuración guardada:\n- Consultorio: ${clinicaActiva ? "Activo" : "Inactivo"}\n- Días: ${diasAbiertos.join(", ") || "Ninguno"}\n- Bloque: ${horaSeleccionada || "No definido"}`;
    alert(resumen);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Cabecera */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Configuración de Horarios</Text>
      <View style={styles.separator} />


      {/* 1. Control General (Activar/Desactivar) */}
      <View style={styles.card}>
        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.switchLabel}>Consultorio Activo</Text>
            <Text style={styles.switchSubLabel}>Permitir citas en línea</Text>
          </View>
          <Switch
            trackColor={{ false: INACTIVE_BG_COLOR, true: ACCENT_COLOR }}
            thumbColor={"#fff"}
            value={clinicaActiva}
            onValueChange={setClinicaActiva}
          />
        </View>
      </View>

      
      {/* 2. Selección de Días de Apertura (En dos filas) */}
      <Text style={styles.sectionTitle}>Días de Atención Semanal</Text>
      <View style={styles.diasContainer}>
        {/* Primera Fila: Lunes a Viernes */}
        <View style={styles.diasRow}>
          {DIAS_SEMANA_LUN_VIE.map(renderDiaButton)}
        </View>

        {/* Segunda Fila: Sábado y Domingo */}
        <View style={styles.diasRow}>
          {DIAS_FIN_SEMANA.map(renderDiaButton)}
        </View>
      </View>
      
      <View style={styles.separator} />

      {/* 3. Selección de Bloques de Hora */}
      <Text style={styles.sectionTitle}>Bloque Horario por Defecto</Text>
      <Text style={styles.sectionSubLabel}>Horario que aplica a los días seleccionados</Text>
      <View style={styles.horasContainer}>
        {bloquesHorarios.map((h) => (
          <TouchableOpacity
            key={h}
            style={[
              styles.horaButton, 
              horaSeleccionada === h ? styles.horaButtonSelected : styles.horaButtonDefault
            ]}
            onPress={() => setHoraSeleccionada(h)}
          >
            <Text style={[
              styles.horaText, 
              horaSeleccionada === h ? styles.horaTextSelected : styles.horaTextDefault
            ]}>
              {h}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      
      {/* Botón Confirmar Cambios */}
      <TouchableOpacity style={styles.confirmButton} onPress={confirmarCambios}>
        <Text style={styles.confirmButtonText}>Guardar Horarios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contentContainer: { paddingHorizontal: 20, paddingVertical: 40, paddingBottom: 100 },
  
  /* Cabecera */
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  backButtonText: { color: TEXT_MUTED, fontSize: 24, fontWeight: "300" },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 20,
    textAlign: "center",
    marginTop: 10,
  },

  /* Separador */
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 25,
  },

  /* Controles */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 8,
    marginTop: 5,
  },
  sectionSubLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 15,
  },

  /* 1. Switch */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  switchSubLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
  },

  /* 2. Días (Toggle Circular - Minimalista, ahora en dos filas) */
  diasContainer: {
    marginVertical: 10,
  },
  diasRow: { // Nuevo estilo para las filas de días
    flexDirection: "row",
    marginBottom: 15, 
    justifyContent: 'flex-start',
    gap: 12, // Espacio entre círculos
  },
  diaButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: "center",
    justifyContent: "center",
  },
  // Estado: Cerrado
  diaButtonClosed: {
    backgroundColor: INACTIVE_BG_COLOR,
  },
  diaTextClosed: { color: TEXT_MUTED, fontSize: 14, fontWeight: "500" },

  // Estado: Abierto
  diaButtonOpen: {
    backgroundColor: ACCENT_COLOR, 
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
  },
  diaTextOpen: { color: "white", fontSize: 14, fontWeight: "700" },

  /* 3. Horas (Bloques) */
  horasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 5,
  },
  horaButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  horaButtonDefault: {
    backgroundColor: INACTIVE_BG_COLOR,
    borderColor: '#E0E0E0',
  },
  horaTextDefault: { color: TEXT_DARK, fontWeight: "500" },
  
  horaButtonSelected: {
    backgroundColor: ACTIVE_BG_COLOR,
    borderColor: ACCENT_COLOR,
  },
  horaTextSelected: { color: ACCENT_COLOR, fontWeight: "700" },

  /* Botón Confirmar */
  confirmButton: {
    backgroundColor: ACCENT_COLOR, 
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    marginTop: 40,
    elevation: 3,
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});