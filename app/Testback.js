import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

export default function Testback() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setData(null);
    try {
      const response = await fetch('https://server-heald.onrender.com/');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderData = () => {
    if (!data) {
      return null;
    }

    return (
      <ScrollView style={styles.dataContainer}>
        <Text style={styles.dataText}>{JSON.stringify(data, null, 2)}</Text>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Press the button to fetch data!</Text>
      <Button title="Fetch Data" onPress={fetchData} color="#841584" />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {renderData()}

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
    fontSize: 18,
    marginBottom: 20,
  },
  dataContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    width: '100%',
  },
  dataText: {
    fontFamily: 'monospace',
  },
});
