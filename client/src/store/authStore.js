import { BASE_URL } from '../constants.js';
import { axiosInstance } from '../axiosConfig';

export const createAuthStore = (set) => ({
  userInfo: localStorage.getItem('boundStore')
    ? JSON.parse(localStorage.getItem('boundStore'))?.state.userInfo
    : null,
  isLoadingUserInfo: false,
  isLoadingRegister: false,
  login: async ({ email, password }) => {
    try {
      set({ isLoadingUserInfo: true });
      const response = await axiosInstance.post(`/api/users/login`, {
        email,
        password,
      });

      set({ userInfo: response.data, isLoadingUserInfo: false });
    } catch (error) {
      set({ isLoadingUserInfo: false });
      throw error;
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post(`/api/users/logout`);
      set({ userInfo: null });
    } catch (error) {
      throw error;
    }
  },
  register: async () => {
    try {
    } catch (error) {}
  },
});
