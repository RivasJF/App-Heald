import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../src/context/AuthContext';
import { findByPatient } from '../../../../../src/services/appointmentService';
import { FontAwesome } from '@expo/vector-icons';
 
export default function MisCitas() {
  const router = useRouter();
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCitas = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await findByPatient(user.id);
        setCitas(data);
        setError(null);
      } catch (e) {
        setError('No se pudieron cargar tus citas.');
        console.error('Error fetching appointments:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, [user]);

  const renderItem = ({ item }) => {
    const fecha = new Date(item.startTime).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    const hora = new Date(item.startTime).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit'
    });

    // Accedemos al nombre del doctor desde el objeto anidado 'user'
    const doctorName = item.doctor.user?.name || 'Doctor';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push({
          pathname: `/mis-citas/${item.id}`,
          params: { cita: JSON.stringify(item) } // Pasamos el objeto como string
        })}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{doctorName}</Text>
            <Text style={styles.cardSubtitle}>{item.doctor.speciality}</Text>
          </View>
          <View style={styles.cardBody}>
            <InfoRow icon="calendar" text={`${fecha} a las ${hora} hrs.`} />
            <InfoRow icon="map-marker" text={item.clinicLocation.address} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Mis Citas' }} />
      <Text style={styles.title}>Mis Citas Creadas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0B4EF2" style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={citas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes citas agendadas.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, text }) => (
  <View style={styles.infoRow}>
    <FontAwesome name={icon} size={16} color="#4B6AA3" style={styles.infoIcon} />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F8FF' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#072B66',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#EAF1FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B4EF2',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#36548B',
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 20,
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#36548B',
    lineHeight: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#D9534F',
    marginTop: 30,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B82B1',
    marginTop: 30,
    fontSize: 16,
  },
});