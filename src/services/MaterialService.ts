import api from '@/lib/axios';

const URL = '/materials';

const MaterialService = {
  create: async (data: any) => {
    return api.post(URL, data);
  },

  listByRnc: async (rncId: string) => {
    const res = await api.get(`${URL}/rnc/${rncId}`);
    return res.data;
  },

  remove: async (id: string) => {
    return api.delete(`${URL}/${id}`);
  },
};

export default MaterialService;
