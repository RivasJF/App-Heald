import api from './api';

const CLINIC_BASE_PATH = '/clinic'; // Ruta base para el controlador de clínicas

/**
 * Busca clínicas cercanas basadas en coordenadas y un radio. (POST /clinic/near)
 * @param {object} body - El cuerpo de la petición.
 * @param {number} body.lat - La latitud del centro de búsqueda.
 * @param {number} body.lng - La longitud del centro de búsqueda.
 * @param {number} [body.radius=5000] - El radio de búsqueda en metros (opcional).
 * @returns {Promise<Array<object>>} Una lista de las clínicas cercanas encontradas.
 */
export const getNearbyClinics = async (body) => {
  try {
    // Hacemos la petición POST al endpoint del backend
    const response = await api.post(`${CLINIC_BASE_PATH}/near`, body);
    return response.data;
  } catch (error) {
    console.error('Error al buscar clínicas cercanas:', error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Obtiene la clínica de un doctor por el ID del doctor. (GET /clinic/:doctorId)
 * @param {string} doctorId - El ID del doctor.
 * @returns {Promise<object>} La clínica encontrada.
 */
export const getClinicByDoctorId = async (doctorId) => {
  try {
    const response = await api.get(`${CLINIC_BASE_PATH}/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la clínica para el doctor ${doctorId}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};