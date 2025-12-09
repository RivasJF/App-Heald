import { Image, Text, View, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CrearCita() {
  const router = useRouter();
  const btnScale = new Animated.Value(1);

  const pressIn = () => Animated.spring(btnScale, { toValue: 0.98, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <SafeAreaView style={styles.safe}>
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
            onPress={() => router.push('/(app)/(clientes)/(tabs)/crear-cita/doctor')}
            activeOpacity={0.9}
            onPressIn={pressIn}
            onPressOut={pressOut}
          >
            <Text style={styles.primaryButtonText}>Agendar cita</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.smallNote}>Atención prioritaria · Pagos seguros · Recordatorios</Text>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  hero: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    flex: 1,
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
  primaryButton: {
    backgroundColor: '#0B4EF2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: 220,
    alignSelf: 'center',
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
  smallNote: {
    color: '#7A93C7',
    fontSize: 13,
    marginTop: 8,
  },
});
