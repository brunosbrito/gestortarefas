import axios from 'axios';

const API_URL = 'http://localhost:3000/auth/login';

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(API_URL, {
      email,
      password,
    });

    const { token } = response.data.access_token;
    
    localStorage.setItem('authToken', response.data.access_token);
    return token;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};