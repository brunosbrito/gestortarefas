import axios from 'axios';
import {
  CreateEffectiveDto,
  UpdateEffectiveDto,
} from '@/interfaces/EffectiveInterface';
import API_URL from '@/config';

const URL = `${API_URL}/effectives`;

export const createEffective = async (data: CreateEffectiveDto) => {
  try {
    const response = await axios.post(URL, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar registro:', error);
    throw error;
  }
};

export const updateEffective = async (data: UpdateEffectiveDto) => {
  try {
    const response = await axios.post(`${URL}/update`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    throw error;
  }
};

export const getEffectivesByShiftAndDate = async (shift: string) => {
  try {
    const response = await axios.get(`${URL}/by-shift-and-date/${shift}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    throw error;
  }
};
