export * from './auth-utils.js';
export * from './camera-utils.js';
export * from './map-utils.js';
export * from './ui-utils.js';
export * from './event-bus.js';
export { default as EventBus } from './event-bus.js';

export function showFormattedDate(date, locale = 'id-ID', options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  let dateObject;
  try {
    dateObject = new Date(date);
    if (isNaN(dateObject.getTime())) {
      throw new Error('Invalid date value provided');
    }
  } catch (error) {
    console.warn(`Invalid date provided to showFormattedDate: ${date}`, error);
    return 'Tanggal tidak valid';
  }

  try {
    const formatter = new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options });
    return formatter.format(dateObject).replace(/\./g, ':');
  } catch (error) {
    console.error("Error formatting date with Intl.DateTimeFormat:", error);
    try {
      return dateObject.toLocaleTimeString(locale, { ...defaultOptions, ...options });
    } catch (fallbackError) {
       console.error("Fallback date formatting failed:", fallbackError);
       return 'Error format tanggal';
    }
  }
}

export function sleep(timeInMs = 1000) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}