/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando la zona horaria local
 * Evita el bug de usar UTC que puede mostrar el día siguiente
 */
export function getCurrentLocalDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convierte una fecha a formato YYYY-MM-DD usando la zona horaria local
 * @param date - Objeto Date a convertir
 */
export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}