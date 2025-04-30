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

export const updateEffective = async (data: UpdateEffectiveDto, id: number) => {
  try {
    const response = await axios.put(`${URL}/${id}`, data);
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

export const deleteEffectives = async (id: number) => {
  try {
    const response = await axios.delete(`${URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar registros:', error);
    throw error;
  }
};

export const enviarEfetivo = async (registro: any) => {
  try {
    const response = await axios.post(
      `https://n8n.gmxindustrial.com.br/webhook-test/efetivo`,
      registro,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao deletar registros:', error);
    throw error;
  }
};
