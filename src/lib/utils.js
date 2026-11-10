export const readSession = (key, fallback) => {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
export const formatDate = (date) => date.replaceAll('-', '.');
