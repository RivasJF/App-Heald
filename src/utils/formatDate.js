/**
 * Formatea una fecha a formato largo legible en español.
 *
 * @param {string | Date | number} dateInput - Fecha en ISO, timestamp o Date
 * @example
 * formatDate("2025-01-15T18:30:00.000Z")
 * // "miércoles, 15 de enero de 2025" (según zona del usuario)
 *
 * @returns {string}
 */
export default function formatDate(dateInput) {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}