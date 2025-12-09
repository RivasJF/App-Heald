import api from './api';

const APPOINTMENT_BASE_PATH = '/appointment'; // Ruta base para el controlador de citas

/**
 * Busca todas las citas de un paciente específico. (GET /appointment/patient/:patientId)
 * @param {string} patientId - El ID del paciente.
 * @returns {Promise<Array<object>>} Una lista de las citas encontradas para el paciente.
 */
export const findByPatient = async (patientId) => {
  try {
    // Hacemos la petición al endpoint del backend
    const response = await api.get(`${APPOINTMENT_BASE_PATH}/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al buscar citas para el paciente ${patientId}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};