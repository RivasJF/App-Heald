import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack} from 'expo-router';
import User from '../src/user.class.js';
import { createUsers } from '../src/scripts/createUsers.js';
import { deleteUsers } from '../src/scripts/deleteUsers.js';

const colors=['#841584', '#f5f5f5', '#222222']

export default function Testback() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setData(null);
    try {
      const response = await fetch('https://server-heald.onrender.com/');
      const json = await response.json();
      const users = json.map(userData => new User(userData.id, userData.name));
      setData(users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchCreateUsers = async () => {
    createUsers();
    setTimeout(() => {
      fetchData();
    }, 1000);
  }
  const fetchDeleteUsers = async () => {
    deleteUsers();
    setTimeout(() => {
      fetchData();
    }, 1000);
  }

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
      <Stack.Screen options={{
        title: 'Test backend',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#f5f5f5',
        },
        headerTitleStyle: {
            fontWeight: 'bold',
        },
        headerTintColor: colors[0],

      }}/>
      <Text style={styles.title}>Precionar para consultar a backend!</Text>
      <View style={styles.buttonContainer}>
      <Button title="Fetch Data" onPress={fetchData} color="#841584" />
      <Button title="Create Users" onPress={fetchCreateUsers} color="#841584" />
      <Button title="Delete All Users" onPress={fetchDeleteUsers} color="#841584" />
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {renderData()}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors[2],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    color: colors[1],
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
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    borderRadius: 10
  }
});
