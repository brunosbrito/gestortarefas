import axios from 'axios';

const API_URL = 'http://localhost:3000/auth/login';

export const login = async (username, password) => {
  try {
    const response = await axios.post(API_URL, {
      username,
      password,
    });
    const { token } = response.data;
    
    localStorage.setItem('authToken', token);
    return token;
  } catch (error) {
    console.error('Erro ao fazer login:', error.response ? error.response.data : error.message);
    throw error;
  }
};