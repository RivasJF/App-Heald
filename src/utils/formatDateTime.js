/**
 * Formatea una fecha/hora en formato ISO (UTC) a una hora legible en formato local (es-MX).
 *
 * @param {string} dateTime - Fecha en formato ISO 8601 con sufijo Z (UTC).
 * @example
 * // Entrada (UTC)
 * const input = "2025-01-15T18:30:00.000Z";
 *
 * // Salida (hora local en México)
 * const result = formatDateTime(input);
 * // "12:30 PM" (dependiendo de la zona horaria del dispositivo)
 *
 * @returns {string} Hora formateada (ej: "12:30 PM")
 */
export default function formatDateTime(dateTime) {
    return new Date(dateTime).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
}  