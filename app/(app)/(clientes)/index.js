import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';

export default function Index() {

  return (
    <View style={styles.container}>
      <Stack.Screen options={{headerShown: false}}/>
      <Text style={styles.title}>Bienvenido a Heald!</Text>
      <Text style={styles.subtitle}>Pagina de Cliente</Text>
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
