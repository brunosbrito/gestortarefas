import axios from 'axios';

// Login function kept for legacy compatibility only
// Authentication is now handled by the host application
export const login = async (email: string, password: string) => {
  console.warn('Login function called but authentication is handled by host');
  throw new Error('Authentication is handled by the host application');
};


export const getStoredToken = () => {
  return (
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  );
};
