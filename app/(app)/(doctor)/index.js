// === IMPORTS PRINCIPALES ===
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "../../../src/context/AuthContext";


// ===============================================================
// ===============    PANTALLA PRINCIPAL DOCTOR    ===============
// ===============================================================
export default function Index() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Text style={styles.title}>¡Bienvenido Doctor!</Text>
      <Text style={styles.subtitle}>Panel de administración</Text>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push("./misDatos")}
      >
        <Text style={styles.menuButtonText}>Mis Datos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push("./consultorio")}
      >
        <Text style={styles.menuButtonText}>Mi Consultorio</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push("./horarios")}
      >
        <Text style={styles.menuButtonText}>Horarios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: "#ff5a5a" }]}
        onPress={signOut}
      >
        <Text style={styles.menuButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}



// ===============================================================
// =====================    MIS DATOS    =========================
// ===============================================================
export function MisDatos() {
  const [nombre, setNombre] = useState("Dr. Juan Pérez");
  const [edad, setEdad] = useState("40");
  const [especialidad, setEspecialidad] = useState("Cardiología");
  const [descripcion, setDescripcion] = useState("Especialista con 10 años de experiencia.");

  return (
    <ScrollView style={styles.pageContainer}>
      <Stack.Screen options={{ title: "Mis Datos" }} />

      <Text style={styles.sectionTitle}>Información del Doctor</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Edad</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={edad}
        onChangeText={setEdad}
      />

      <Text style={styles.label}>Especialidad</Text>
      <TextInput
        style={styles.input}
        value={especialidad}
        onChangeText={setEspecialidad}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
      />
    </ScrollView>
  );
}



// ===============================================================
// ==================    MI CONSULTORIO    =======================
// ===============================================================
export function Consultorio() {
  const [calle, setCalle] = useState("Av. Reforma");
  const [colonia, setColonia] = useState("Centro");
  const [numero, setNumero] = useState("123");
  const [ciudad, setCiudad] = useState("CDMX");

  return (
    <ScrollView style={styles.pageContainer}>
      <Stack.Screen options={{ title: "Mi Consultorio" }} />

      <Text style={styles.sectionTitle}>Datos del Consultorio</Text>

      <Text style={styles.label}>Calle</Text>
      <TextInput style={styles.input} value={calle} onChangeText={setCalle} />

      <Text style={styles.label}>Número</Text>
      <TextInput style={styles.input} value={numero} onChangeText={setNumero} />

      <Text style={styles.label}>Colonia</Text>
      <TextInput style={styles.input} value={colonia} onChangeText={setColonia} />

      <Text style={styles.label}>Ciudad</Text>
      <TextInput style={styles.input} value={ciudad} onChangeText={setCiudad} />
    </ScrollView>
  );
}



// ===============================================================
// ======================    HORARIOS    ==========================
// ===============================================================
export function Horarios() {
  const [dias, setDias] = useState({
    Lunes: true,
    Martes: true,
    Miércoles: false,
    Jueves: true,
    Viernes: true,
    Sábado: false,
    Domingo: false,
  });

  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("18:00");

  const toggleDia = (dia) => {
    setDias({ ...dias, [dia]: !dias[dia] });
  };

  return (
    <ScrollView style={styles.pageContainer}>
      <Stack.Screen options={{ title: "Horarios" }} />

      <Text style={styles.sectionTitle}>Disponibilidad</Text>

      {Object.keys(dias).map((dia) => (
        <View key={dia} style={styles.dayRow}>
          <Text style={styles.label}>{dia}</Text>
          <Switch value={dias[dia]} onValueChange={() => toggleDia(dia)} />
        </View>
      ))}

      <Text style={styles.label}>Hora de inicio</Text>
      <TextInput style={styles.input} value={horaInicio} onChangeText={setHoraInicio} />

      <Text style={styles.label}>Hora de cierre</Text>
      <TextInput style={styles.input} value={horaFin} onChangeText={setHoraFin} />
    </ScrollView>
  );
}



// ===============================================================
// ========================    ESTILOS    =========================
// ===============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#5A2E98",
  },

  subtitle: {
    fontSize: 18,
    color: "#777",
    marginBottom: 30,
  },

  menuButton: {
    width: "80%",
    backgroundColor: "#5A2E98",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
  },

  menuButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  pageContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5A2E98",
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#444",
    marginTop: 15,
  },

  input: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },

  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});
