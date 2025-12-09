import api from './api';

const SCHEDULE_BASE_PATH = '/schedule'; // Ruta base para el controlador de horarios

/**
 * Obtiene el horario de un doctor por su ID de usuario. (GET /schedule/:id)
 * @param {string} userId - El ID de usuario del doctor.
 * @returns {Promise<object>} El objeto del horario encontrado.
 */
export const getScheduleByUserId = async (userId) => {
  try {
    const response = await api.get(`${SCHEDULE_BASE_PATH}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el horario para el usuario ${userId}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Actualiza el horario de un doctor. (PATCH /schedule/:id)
 * @param {string} doctorId - El ID del doctor.
 * @param {object} updateDto - El objeto con los días y descansos a actualizar.
 * @param {Array<object>} updateDto.days - Lista de días laborables.
 * @param {Array<object>} updateDto.breaks - Lista de descansos.
 * @returns {Promise<object>} El horario actualizado.
 */
export const updateSchedule = async (doctorId, updateDto) => {
  try {
    const response = await api.patch(`${SCHEDULE_BASE_PATH}/${doctorId}`, updateDto);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el horario para el doctor ${doctorId}:`, error.response ? error.response.data : error);
    throw error.response ? error.response.data : error;
  }
};
