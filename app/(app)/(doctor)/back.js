// ===================================
// FILE: BackScreen.js (MODIFICADO para buscar por ID)
// ===================================

import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert, Button, TextInput } from 'react-native';

// ⚠️ Debes importar ambas funciones de tu servicio (o solo la que necesitas)
// Asumo que tu servicio ahora se llama 'userServices' y contiene ambas funciones.
import { getAllUsers, getUserById } from '../../../src/services/userServices'; 
// Importa setToken para poder usar el token en la llamada protegida
import { setToken } from '../../../src/services/api'; 


// ⚠️ SIMULACIÓN DE TOKEN: Debes tener un token válido (de tu función de login)
// Si la búsqueda por ID es una ruta protegida (que lo es, según tu UserController),
// debes llamar a setToken(UN_TOKEN_REAL) después de un login exitoso.
// Por ahora, usaremos un token de ejemplo, pero el valor real debe venir del login.
const EXAMPLE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.2_Ej0xT1-xX8C3S5yH7G2G6z6qX5tG3p1H6E6W4M6D4';


export default function BackScreen() {
  const [user, setUser] = useState(null); // Cambiamos para almacenar UN SOLO usuario
  const [userIdInput, setUserIdInput] = useState(''); // Nuevo estado para el ID de entrada
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 🔄 Manejador de carga para buscar UN SOLO usuario por ID.
   */
  const handleLoadUserById = async () => {
    if (loading) return; 
    
    // Asegúrate de que el ID no esté vacío
    if (!userIdInput) {
        Alert.alert('ID Requerido', 'Por favor, introduce un ID de usuario para buscar.');
        return;
    }

    try {
      setLoading(true);
      setError(null);
      setUser(null); // Limpiar usuario anterior
      
      
      console.log(`Buscando usuario con ID: ${userIdInput}`);
      
      // Llama a la función de servicio con el ID de la entrada
      const data = await getUserById(userIdInput);
      
      setUser(data); // Guarda el objeto de usuario individual
      
    } catch (err) {
      // Manejo de errores específicos (ej: 404 Not Found, 401 Unauthorized)
      const status = err.status || (err.response && err.response.status);
      let errorMessage = `Error desconocido: ${err.message || JSON.stringify(err)}`;

      if (status === 404) {
          errorMessage = `Usuario con ID ${userIdInput} no encontrado (404).`;
      } else if (status === 401) {
          errorMessage = `No autorizado (401). ¿Token válido?`;
      } else {
          errorMessage = `Error: ${err.message || 'Verifica la conexión y el servidor.'}`;
      }
      
      setError(errorMessage);
      Alert.alert('Error de Búsqueda', errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.text}>Buscando usuario...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.text}>Intenta con otro ID o verifica el token.</Text>
        </View>
      );
    }

    if (user === null) {
      return (
        <View style={styles.center}>
          <Text style={styles.text}>Introduce un ID y pulsa el botón para buscar un usuario.</Text>
        </View>
      );
    }

    // Renderizar el único usuario encontrado
    return (
        <View style={styles.userCard}>
            <Text style={styles.userName}>Usuario Encontrado: {user.name || 'Sin Nombre'}</Text>
            <Text style={styles.userEmail}>Email: {user.email}</Text>
            <Text style={styles.userId}>ID: {user.id}</Text>
            <Text style={styles.userRole}>Rol: {user.role || 'N/A'}</Text>
        </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Buscar Usuario por ID</Text>

      <TextInput
        style={styles.input}
        placeholder="Introduce ID de usuario (Ej: UUID)"
        autoCapitalize="none"
        value={userIdInput}
        onChangeText={setUserIdInput}
      />
      
      {/* Botón para buscar UN SOLO usuario */}
      <Button 
        title={loading ? "Buscando..." : "Buscar Usuario por ID (GET /user/:id)"}
        onPress={handleLoadUserById}
        disabled={loading || !userIdInput}
        color="#007bff"
      />
      
      <View style={styles.listContainer}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Estilos de la vista (Iguales a los anteriores, solo se añade el input) ---
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: { // Nuevo estilo para el TextInput
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  // ... (otros estilos)
  text: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#007bff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#555',
  },
  userId: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  userRole: { // Nuevo estilo para mostrar el rol
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5a6268',
    marginTop: 5,
  }
});