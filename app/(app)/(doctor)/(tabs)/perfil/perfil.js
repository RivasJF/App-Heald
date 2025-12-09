import { Stack, Link } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../../../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

export default function DoctorProfileScreen() {
  const { user, signOut } = useAuth();

  // Prototipo de menú para el doctor
  const menuItems = [
    {
      href: '/(app)/(doctor)/perfil/misDatos',
      icon: 'user-md',
      label: 'Mis Datos Profesionales',
      description: 'Edita tu especialidad y biografía.'
    },
    {
      href: '/(app)/(doctor)/horarios',
      icon: 'calendar',
      label: 'Gestionar Horarios',
      description: 'Configura tus días y horas de atención.'
    },
    {
      href: '/(app)/(doctor)/consultorio',
      icon: 'hospital-o',
      label: 'Mi Consultorio',
      description: 'Actualiza la dirección de tu clínica.'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>Bienvenido, Dr. {user?.name || 'Doctor'}</Text>
      </View>

      <ScrollView>
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

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#072B66',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B82B1',
    marginTop: 4,
  },
  menuContainer: {
    margin: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#072B66',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden', // Para que el borde redondeado afecte a los hijos
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  icon: {
    width: 30,
    textAlign: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  menuButtonText: {
    fontSize: 16,
    color: '#072B66',
    fontWeight: '600',
  },
  menuButtonDescription: {
    fontSize: 12,
    color: '#7A93C7',
    marginTop: 2,
  },
  logoutButton: {
    marginHorizontal: 24,
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#D9534F',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});