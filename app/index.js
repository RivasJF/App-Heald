import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  function changeRoute() {
    router.push('/Testback');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Heald!</Text>
      <Text style={styles.subtitle}>Your personal health assistant.</Text>
      <View style={styles.buttonContainer}>
        <Button title="Go to Test Page" onPress={changeRoute} color="#841584" />
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
