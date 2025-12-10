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

/**
 * Crea un nuevo perfil de doctor. (POST /doctor)
 * @param {object} createDoctorDto - Los datos para crear el perfil del doctor.
 * @param {string} createDoctorDto.userId - El ID del usuario a asociar.
 * @param {string} createDoctorDto.speciality - La especialidad del doctor.
 * @param {string} createDoctorDto.biography - La biografía del doctor.
 * @returns {Promise<object>} El perfil del doctor creado.
 */
export const createDoctor = async (createDoctorDto) => {
  try {
    const response = await api.post(DOCTOR_BASE_PATH, createDoctorDto);
    return response.data;
  } catch (error) {
    console.error('Error al crear el perfil del doctor:', error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};
