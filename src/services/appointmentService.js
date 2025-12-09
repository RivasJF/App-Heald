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

/**
 * Busca todas las citas de un doctor específico. (GET /appointment/doctor/:doctorId)
 * @param {string} doctorId - El ID del doctor.
 * @returns {Promise<Array<object>>} Una lista de las citas encontradas para el doctor.
 */
export const findByDoctor = async (doctorId) => {
  try {
    const response = await api.get(`${APPOINTMENT_BASE_PATH}/doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al buscar citas para el doctor ${doctorId}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Obtiene los horarios disponibles para un doctor en una fecha específica. (GET /appointment/availability/:doctorId/:date)
 * @param {string} doctorId - El ID del doctor.
 * @param {string} date - La fecha en formato 'YYYY-MM-DD'.
 * @returns {Promise<Array<string>>} Una lista de los horarios disponibles (ej: ['09:00', '10:30']).
 */
export const getDoctorAvailability = async (doctorId, date) => {
  try {
    const response = await api.get(`${APPOINTMENT_BASE_PATH}/availability/${doctorId}/${date}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la disponibilidad para el doctor ${doctorId} en la fecha ${date}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Cancela una cita. (DELETE /appointment/:appointmentId)
 * @param {string} appointmentId - El ID de la cita a cancelar.
 * @returns {Promise<object>} La cita cancelada.
 */
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await api.delete(`${APPOINTMENT_BASE_PATH}/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al cancelar la cita ${appointmentId}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Crea una nueva cita. (POST /appointment)
 * @param {object} dto - Los datos de la cita a crear.
 * @param {string} dto.doctorId - ID del doctor.
 * @param {string} dto.patientId - ID del paciente.
 * @param {string} dto.clinicLocationId - ID de la ubicación de la clínica.
 * @param {string} dto.startTime - Fecha y hora de inicio en formato ISO. (ej:'2025-12-10T10:00:00')
 * @param {string} dto.endTime - Fecha y hora de fin en formato ISO. (ej:'2025-12-10T10:30:00')
 * @returns {Promise<object>} La cita creada.
 */
export const createAppointment = async (dto) => {
  try {
    const response = await api.post(APPOINTMENT_BASE_PATH, dto);
    return response.data;
  } catch (error) {
    console.error('Error al crear la cita:', error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};