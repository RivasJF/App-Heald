import api from './api';

const DOCTOR_BASE_PATH = '/doctor-status'; // Ruta base para el controlador de doctores

/**
 * Actualiza el estado de servicio de un doctor (activo/inactivo).
 * @param {string} doctorId - El ID del doctor.
 * @param {boolean} active - El nuevo estado.
 * @returns {Promise<object>} El estado del servicio actualizado.
 */
export const updateDoctorStatus = async (doctorId, active) => {
  try {
    const response = await api.patch(`${DOCTOR_BASE_PATH}/${doctorId}/service-status`, { active });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el estado del doctor ${doctorId}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};