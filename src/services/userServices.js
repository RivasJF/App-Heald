import api from './api';

const USER_BASE_PATH = '/user'; // Ruta base del controlador

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));//delay para simular tiempo de espera




// --- Peticiones Públicas ---

/**
 * Registra un nuevo usuario. (POST /user)
 * @param {object} userData - Datos del usuario (ej: { email, password, name, ... })
 * @returns {Promise<object>} El usuario creado.
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post(USER_BASE_PATH, userData);
    return response.data;
  } catch (error) {
    // Manejo de errores (ej: error.response.data.message)
    throw error.response ? error.response.data : error;
  }
};


/**
 * Obtiene todos los usuarios. (GET /user)
 * @returns {Promise<Array<object>>} Lista de todos los usuarios.
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get(USER_BASE_PATH);
    await delay(2000);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};


// --- Peticiones Protegidas (Requieren Token JWT) ---

/**
 * Obtiene un usuario por su ID. (GET /user/:id)
 * @param {string} id - ID del usuario.
 * @returns {Promise<object>} El usuario encontrado.
 */
export const getUserById = async (id) => {
  try {
    const response = await api.get(`${USER_BASE_PATH}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Obtiene un usuario por su email. (GET /user/email/:email)
 * ⚠️ NOTA: Requiere que hayas cambiado la ruta en el backend a '/user/email/:email'
 * para evitar el conflicto con la ruta GET /user/:id.
 * @param {string} email - Email del usuario.
 * @returns {Promise<object>} El usuario encontrado.
 */
export const getUserByEmail = async (email) => {
  try {
    // Usamos la ruta corregida recomendada para evitar conflicto
    const response = await api.get(`${USER_BASE_PATH}/email/${email}`); 
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Actualiza la información de un usuario. (PATCH /user/:id)
 * @param {string} id - ID del usuario a actualizar.
 * @param {object} updateData - Datos a actualizar (ej: { name, email }).
 * @returns {Promise<object>} El usuario actualizado.
 */
export const updateUser = async (id, updateData) => {
  try {
    const response = await api.patch(`${USER_BASE_PATH}/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Elimina un usuario por su ID. (DELETE /user/:id)
 * @param {string} id - ID del usuario a eliminar.
 * @returns {Promise<object>} El usuario eliminado.
 */
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`${USER_BASE_PATH}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};