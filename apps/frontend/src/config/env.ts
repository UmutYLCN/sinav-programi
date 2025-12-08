// Vite proxy kullanıyorsak, relative URL kullanmalıyız
// Development'ta proxy, production'da tam URL
const DEFAULT_API_URL = import.meta.env.DEV ? '/api' : 'http://localhost:3000/api';

export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL,
};

