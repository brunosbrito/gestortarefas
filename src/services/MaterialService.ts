import API_URL from '@/config';
import axios from 'axios';
const URL = `${API_URL}/materials`;

const MaterialService = {
  create: async (data: any) => {
    return axios.post(URL, data);
  },

  listByRnc: async (rncId: string) => {
    const res = await axios.get(`${URL}/rnc/${rncId}`);
    return res.data;
  },

  remove: async (id: string) => {
    return axios.delete(`${URL}/${id}`);
  },
};

export default MaterialService;
