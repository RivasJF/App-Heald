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


/**
 * Establece un cierre diario para un doctor a partir de una hora específica. (POST /doctor/:doctorId/daily-closure)
 * @param {string} doctorId - El ID del doctor.
 * @param {object} closureDto - El DTO con la información del cierre.
 * @param {string} closureDto.date - La fecha del cierre en formato 'YYYY-MM-DD'.
 * @param {string} closureDto.closedAt - La hora del cierre en formato 'HH:mm'.
 * @returns {Promise<object>} La respuesta del servidor.
 */
export const setDailyClosure = async (doctorId, closureDto) => {
  try {
    const response = await api.post(`${DOCTOR_BASE_PATH}/${doctorId}/daily-closure`, closureDto);
    return response.data;
  } catch (error) {
    console.error(`Error al establecer el cierre diario para el doctor ${doctorId}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Establece un día libre para un doctor. (POST /doctor-status/:doctorId/day-off)
 * @param {string} doctorId - El ID del doctor.
 * @param {object} dayOffDto - El DTO con la información del día libre.
 * @param {string} dayOffDto.date - La fecha del día libre en formato 'YYYY-MM-DD'.
 * @returns {Promise<object>} La respuesta del servidor.
 */
export const setDayOff = async (doctorId, dayOffDto) => {
  try {
    const response = await api.post(`${DOCTOR_BASE_PATH}/${doctorId}/day-off`, dayOffDto);
    return response.data;
  } catch (error) {
    console.error(`Error al establecer el día libre para el doctor ${doctorId}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};