import api from './api';

const DOCTOR_BASE_PATH = '/doctor'; // Ruta base para el controlador de doctores

/**
 * Busca el perfil de un doctor por el ID de su usuario asociado. (GET /doctor/user/:userId)
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<object>} El perfil del doctor encontrado.
 */
export const getDoctorByUserId = async (userId) => {
  try {
    const response = await api.get(`${DOCTOR_BASE_PATH}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al buscar el perfil del doctor para el usuario ${userId}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};