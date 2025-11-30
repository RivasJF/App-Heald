// --- NO MODIFIQUES estos imports ---
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';

// --- Imports adicionales que agrego (sin cambiar los anteriores) ---
import React, { useState, useMemo } from 'react';
import {
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';

// -----------------------
// App completa (un solo archivo)
// -----------------------
export default function Index() {
  const [screen, setScreen] = useState('bienvenida'); // bienvenida / doctor / fecha / resumen / ticket

  // Selecciones
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Mock doctores
  const doctors = [
    {
      id: 'd1',
      name: 'Dr. Juan Pérez',
      specialty: 'Cardiología',
      sex: 'Masculino',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 4.9,
    },
    {
      id: 'd2',
      name: 'Dra. Ana Gómez',
      specialty: 'Dermatología',
      sex: 'Femenino',
      photo: 'https://randomuser.me/api/portraits/women/45.jpg',
      rating: 4.8,
    },
    {
      id: 'd3',
      name: 'Dr. Carlos Ortega',
      specialty: 'Pediatría',
      sex: 'Masculino',
      photo: 'https://randomuser.me/api/portraits/men/76.jpg',
      rating: 4.7,
    },
    {
      id: 'd4',
      name: 'Dra. Sofía Ruiz',
      specialty: 'Ginecología',
      sex: 'Femenino',
      photo: 'https://randomuser.me/api/portraits/women/19.jpg',
      rating: 4.9,
    },
  ];

  // Fechas disponibles (14 días)
  const dates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dayLabel = d.toLocaleDateString('es-ES', { weekday: 'short' }).split('.')[0]; // Ej: 'Lun'
      const dateNumber = String(d.getDate()); // Ej: '25'
      list.push({ iso: `${yyyy}-${mm}-${dd}`, label: dayLabel, dateNumber: dateNumber });
    }
    return list;
  }, []);

  const timeSlots = ['09:00', '09:30', '10:00', '11:00', '13:00', '14:30', '16:00', '17:30'];

  const ticketCode = useMemo(() => {
    return `APPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }, [screen]);

  const btnScale = new Animated.Value(1);
  const pressIn = () => Animated.spring(btnScale, { toValue: 0.98, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  // ------------------------------------
  // 1) PANTALLA DE BIENVENIDA
  // ------------------------------------
  if (screen === 'bienvenida') {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: 'Bienvenido' }} />

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>HealthCare Premium</Text>
          <Text style={styles.heroSubtitle}>Agenda tu cita con especialistas de confianza</Text>

          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1580281657521-54a3a2d7f8f9?q=80&w=1000&auto=format&fit=crop',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setScreen('doctor')}
              activeOpacity={0.9}
              onPressIn={pressIn}
              onPressOut={pressOut}
            >
              <Text style={styles.primaryButtonText}>Agendar cita</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.smallNote}>Atención prioritaria · Pagos seguros · Recordatorios</Text>
        </View>

        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  // ------------------------------------
  // 2) SELECCIÓN DE DOCTOR
  // ------------------------------------
  if (screen === 'doctor') {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: 'Selecciona un doctor' }} />

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Doctores disponibles</Text>
          <TouchableOpacity onPress={() => { setSelectedDoctor(null); setSelectedDate(null); setSelectedTime(null); setScreen('bienvenida'); }}>
            <Text style={styles.linkText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {doctors.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[styles.card, selectedDoctor?.id === d.id && styles.cardSelected]}
              onPress={() => { setSelectedDoctor(d); setScreen('fecha'); }}
              activeOpacity={0.92}
            >
              <Image source={{ uri: d.photo }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{d.name}</Text>
                <Text style={styles.cardSubtitle}>{d.specialty} · {d.sex}</Text>

                <View style={styles.rowBetween}>
                  <View style={styles.ratingBox}>
                    <Text style={styles.ratingText}>⭐ {d.rating.toFixed(1)}</Text>
                  </View>

                  <TouchableOpacity onPress={() => { setSelectedDoctor(d); setScreen('fecha'); }}>
                    <Text style={styles.selectText}>Ver horarios →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  // ------------------------------------
  // 3) SELECCIÓN DE FECHA/HORA
  // ------------------------------------
  if (screen === 'fecha') {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: 'Seleccionar fecha y hora' }} />

        <View style={[styles.headerRow, { paddingHorizontal: 0 }]}>
          <TouchableOpacity onPress={() => setScreen('doctor')} style={{ padding: 18 }}>
            <Text style={styles.linkText}>← Doctores</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitleSmall}>Agenda</Text>
          <View style={{ width: 64 }} />
        </View>

        {/* Info del Doctor */}
        <View style={styles.doctorInfoContainer}>
          <Image source={{ uri: selectedDoctor.photo }} style={styles.doctorInfoAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorInfoName}>{selectedDoctor.name}</Text>
            <Text style={styles.doctorInfoSpec}>{selectedDoctor.specialty}</Text>
            <Text style={styles.doctorInfoRating}>⭐ {selectedDoctor.rating.toFixed(1)}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainerDate}>

          {/* Selección de Fecha */}
          <View style={styles.containerSection}>
            <Text style={styles.label}>Elige un día disponible</Text>

            <FlatList
              horizontal
              data={dates}
              keyExtractor={(i) => i.iso}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 0 }}
              renderItem={({ item }) => {
                const chosen = selectedDate === item.iso;
                return (
                  <TouchableOpacity
                    style={[styles.dayCard, chosen && styles.dayCardActive]}
                    onPress={() => { setSelectedDate(item.iso); setSelectedTime(null); }}
                  >
                    <Text style={[styles.dayLabel, chosen && styles.dayLabelActive]}>{item.label}</Text>
                    <Text style={[styles.dateNumber, chosen && styles.dateNumberActive]}>{item.dateNumber}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Selección de Horario */}
          <View style={[styles.containerSection, { marginTop: 20 }]}>
            <Text style={styles.label}>Horarios</Text>

            <View style={styles.timeGrid}>
              {timeSlots.map((t) => {
                const chosen = t === selectedTime;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timeChip, chosen && styles.timeChipActive]}
                    onPress={() => setSelectedTime(t)}
                  >
                    <Text style={[styles.timeChipText, chosen && styles.timeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ marginTop: 30 }}>
              <TouchableOpacity
                style={[styles.primaryButton, !(selectedDate && selectedTime) && styles.disabledButton]}
                onPress={() => selectedDate && selectedTime && setScreen('resumen')}
                activeOpacity={selectedDate && selectedTime ? 0.8 : 1}
              >
                <Text style={styles.primaryButtonText}>
                  {selectedDate && selectedTime ? 'Continuar' : 'Selecciona fecha y hora'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>

        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  // ------------------------------------
  // 4) RESUMEN (solo nombre del paciente)
  // ------------------------------------
  if (screen === 'resumen') {
    const readableDate = new Date(selectedDate).toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: 'Resumen de la cita' }} />

        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setScreen('fecha')}>
            <Text style={styles.linkText}>← Fecha</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitleSmall}>Resumen</Text>
          <View style={{ width: 64 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>

          <View style={styles.summaryCard}>
            <Image source={{ uri: selectedDoctor.photo }} style={styles.summaryAvatar} />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.summaryName}>{selectedDoctor.name}</Text>
              <Text style={styles.summarySpec}>{selectedDoctor.specialty}</Text>
              <Text style={styles.summaryMeta}>Sexo: {selectedDoctor.sex}</Text>
              <Text style={styles.summaryMeta}>Horario: {selectedTime} · {readableDate}</Text>
            </View>
          </View>

          {/* Solo el nombre del paciente */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Datos del Paciente</Text>
            <Text style={styles.infoLine}>Nombre: Juan Pérez García</Text>
          </View>

          <View style={{ width: '100%', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 12 }]}
              onPress={() => setScreen('ticket')}
            >
              <Text style={styles.primaryButtonText}>Confirmar cita</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  // ------------------------------------
  // 5) TICKET
  // ------------------------------------
  if (screen === 'ticket') {
    const readableDate = selectedDate
      ? new Date(selectedDate).toLocaleDateString('es-ES', {
          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        })
      : '';

    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: 'Ticket' }} />

        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => { setScreen('bienvenida'); setSelectedDoctor(null); setSelectedDate(null); setSelectedTime(null); }}>
            <Text style={styles.linkText}>← Inicio</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitleSmall}>Ticket</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.ticketContainer}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketTitle}>ticket</Text>
            <Text style={styles.ticketCode}>{ticketCode}</Text>
          </View>

          <View style={styles.ticketBody}>
            <Image source={{ uri: selectedDoctor.photo }} style={styles.ticketAvatar} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.ticketName}>{selectedDoctor.name}</Text>
              <Text style={styles.ticketSpec}>{selectedDoctor.specialty}</Text>
              <Text style={styles.ticketMeta}>Fecha: {readableDate}</Text>
              <Text style={styles.ticketMeta}>Hora: {selectedTime}</Text>
              <Text style={styles.ticketMeta}>Paciente: Juan Pérez García</Text>
            </View>
          </View>

          <View style={styles.qrMock}>
            <Text style={{ color: '#0B4EF2', fontWeight: '700' }}>--- Código  ---</Text>
            <Text style={{ color: '#0B4EF2', marginTop: 6 }}>{ticketCode}</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 18, alignSelf: 'center', width: '80%' }]}
            onPress={() => {
              setSelectedDoctor(null);
              setSelectedDate(null);
              setSelectedTime(null);
              setScreen('bienvenida');
            }}
          >
            <Text style={styles.primaryButtonText}>Finalizar</Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return null;
}

// -----------------------
// ESTILOS (ajustados para la nueva vista 'fecha')
// -----------------------
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },

  // HERO
  hero: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#072B66',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#4B6AA3',
    textAlign: 'center',
    maxWidth: '85%',
  },
  heroImage: {
    width: width * 0.9,
    height: 160,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#0B4EF2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: 220,
    alignSelf: 'center', // Alineación central añadida
    alignItems: 'center',
    shadowColor: '#0B4EF2',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: { opacity: 0.5 },

  smallNote: {
    color: '#7A93C7',
    fontSize: 13,
    marginTop: 8,
  },

  // HEADER
  headerRow: {
    marginTop: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#072B66',
    paddingHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitleSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: '#072B66',
  },

  linkText: {
    color: '#0B4EF2',
    fontWeight: '700',
    padding: 8,
  },

  scrollContainer: {
    padding: 18,
    paddingBottom: 40,
    gap: 12,
  },
  scrollContainerDate: { // Contenedor para la vista 'fecha'
    paddingBottom: 40,
  },

  // CARD (Doctor Selection)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#072B66',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: '#0B4EF2',
    transform: [{ scale: 1.01 }],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#EAF1FF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#072B66',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B82B1',
    marginBottom: 6,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingBox: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: { color: '#0B4EF2', fontWeight: '700' },
  selectText: { color: '#0B4EF2', fontWeight: '700' },

  // Fecha y Hora (Doctor Info y Selección)
  doctorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#072B66',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  doctorInfoAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#EAF1FF',
  },
  doctorInfoName: { fontSize: 16, fontWeight: '800', color: '#072B66' },
  doctorInfoSpec: { fontSize: 13, color: '#6B82B1', marginTop: 2 },
  doctorInfoRating: {
    fontSize: 13,
    color: '#0B4EF2',
    fontWeight: '700',
    marginTop: 4
  },
  containerSection: { paddingHorizontal: 18 },
  label: { color: '#36548B', fontWeight: '700', marginBottom: 12, fontSize: 15 },
  
  // Día Card (Horizontal List)
  dayCard: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: 60,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#072B66',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#EAF1FF',
  },
  dayCardActive: { 
    backgroundColor: '#0B4EF2', 
    borderColor: '#0B4EF2',
    transform: [{ scale: 1.05 }],
  },
  dayLabel: { color: '#6B82B1', fontWeight: '600', fontSize: 13, marginBottom: 4 },
  dayLabelActive: { color: '#EAF1FF' },
  dateNumber: { color: '#072B66', fontWeight: '800', fontSize: 20 },
  dateNumberActive: { color: '#fff' },

  // Time Grid (Chips)
  timeGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, // Espacio entre chips
  },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Bordes más redondeados
    borderWidth: 1.5,
    borderColor: '#EAF1FF',
    shadowColor: '#072B66',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  timeChipActive: { 
    backgroundColor: '#0B4EF2',
    borderColor: '#0B4EF2',
    transform: [{ scale: 1.05 }],
  },
  timeChipText: { 
    color: '#223762', 
    fontWeight: '700', 
    fontSize: 14 
  },
  timeChipTextActive: { 
    color: '#fff' 
  },

  // Resumen
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#072B66',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryAvatar: { width: 86, height: 86, borderRadius: 44 },
  summaryName: { fontSize: 18, fontWeight: '800', color: '#072B66' },
  summarySpec: { color: '#6B82B1', marginTop: 4, marginBottom: 6 },
  summaryMeta: { color: '#4B6AA3', fontWeight: '700', marginTop: 4 },

  infoBox: {
    backgroundColor: '#EEF4FF',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  infoTitle: { fontWeight: '800', color: '#072B66', marginBottom: 8 },
  infoLine: { color: '#24407A', marginBottom: 6 },

  // Ticket
  ticketContainer: { padding: 18, alignItems: 'center' },
  ticketHeader: {
    width: '92%',
    backgroundColor: '#EAF1FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketTitle: { color: '#072B66', fontWeight: '900', fontSize: 20 },
  ticketCode: { color: '#0B4EF2', fontWeight: '800', marginTop: 6 },
  ticketBody: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#072B66',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 5,
  },
  ticketAvatar: { width: 86, height: 86, borderRadius: 44 },
  ticketName: { fontWeight: '800', color: '#072B66', fontSize: 18 },
  ticketSpec: { color: '#6B82B1' },
  ticketMeta: { marginTop: 6, color: '#24407A', fontWeight: '700' },

  qrMock: {
    marginTop: 14,
    width: '92%',
    backgroundColor: '#F7FBFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F0FF',
  },
});
