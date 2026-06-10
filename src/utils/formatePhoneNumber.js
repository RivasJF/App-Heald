/**
 * Limpia un número telefónico mexicano removiendo el prefijo +52
 * y caracteres no numéricos.
 *
 * @param {string} phoneNumber - Número en formato internacional o libre
 * @example
 * formatPhoneNumber('+52 55 1234 5678') // '5512345678'
 * formatPhoneNumber('+52-55-1234-5678') // '5512345678'
 * formatPhoneNumber('5512345678')       // '5512345678'
 *
 * @returns {string} Número limpio sin prefijo país
 */
export default function formatPhoneNumber(phoneNumber) {
  if (typeof phoneNumber !== 'string') {
    throw new Error('phoneNumber must be a string');
  }

  // Elimina todo lo que no sea número
  let cleaned = phoneNumber.replace(/\D/g, '');

  // Quita prefijo 52 si existe
  if (cleaned.startsWith('+52') && cleaned.length > 9) {
    cleaned = cleaned.slice(3);
  }

  return cleaned;
}
