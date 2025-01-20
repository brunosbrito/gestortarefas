import axios from 'axios';
import { CreateEffectiveDto, UpdateEffectiveDto } from '@/interfaces/EffectiveInterface';

const API_URL = 'http://localhost:3000/effectives';

export const createEffective = async (data: CreateEffectiveDto) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar registro:', error);
    throw error;
  }
};

export const updateEffective = async (data: UpdateEffectiveDto) => {
  try {
    const response = await axios.post(`${API_URL}/update`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    throw error;
  }
};

export const getEffectivesByShiftAndDate = async (shift: string) => {
  try {
    const response = await axios.get(`${API_URL}/by-shift-and-date/${shift}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    throw error;
  }
};