import api from './api'; 
import * as SecureStore from 'expo-secure-store';

const AUTH_BASE_PATH = '/auth';

/**
 * Inicia sesión de un usuario. (POST /auth/login)
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<object>} Objeto con access_token y datos del usuario.
 */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post(`${AUTH_BASE_PATH}/login`, {
      email: email,
      password: password,
    });
    
    if (response.data.access_token) {
      await SecureStore.setItemAsync('userToken', response.data.access_token);
    }
    
    // Tu backend devuelve { access_token: '...', user: { ... } }
    return response.data; 
  } catch (error) {
    // Captura errores como 'UnauthorizedException' (Password incorrect o usuario no encontrado)
    const errorData = error.response ? error.response.data : error;
    console.error('Login Error:', errorData);
    throw errorData;
  }
};