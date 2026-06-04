// Use the environment variable if available, otherwise default to the Render backend
export const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://sawaflix-backend.onrender.com').replace(/\/$/, '');

console.log("Configured BACKEND_URL:", BACKEND_URL);
