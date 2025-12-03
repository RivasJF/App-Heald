import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';

const colors=['#841584']

export default function Index() {
    const { signOut } = useAuth(); 

  return (
    <View style={styles.container}>
      <Stack.Screen options={{headerShown: false}}/>
      <Text style={styles.title}>Bienvenido a Heald!</Text>
      <Text style={styles.subtitle}>Pagina de doctor</Text>
      
      {/* Logout Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#FF6347', marginTop: 10 }]} // Example styling for logout button
            onPress={signOut}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '60%',
    borderRadius: 10,
    overflow: 'hidden',
  },
});
