import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Stack, useRouter } from 'expo-router';

const colors=['#841584']

export default function Index() {
  const router = useRouter();

  function changeRoute() {
    router.push('/Testback');
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'Home',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#f5f5f5',
        },
        headerTitleStyle: {
            fontWeight: 'bold',
        },
        headerTintColor: colors[0],

      }}/>
      <Text style={styles.title}>Bienvenido a Heald!</Text>
      <Text style={styles.subtitle}>Creador de citas remoto.</Text>

      <View style={styles.buttonContainer}>
        <Button title="Pagina de Backend" onPress={changeRoute} color={colors[0]} />
      </View>
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
