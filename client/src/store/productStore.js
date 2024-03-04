import { axiosInstance } from '../axiosConfig';

export const createProductStore = (set) => ({
  isCreateProductLoading: false,
  isDeleteProductLoading: false,
  isEditProductLoading: false,

  createProduct: async () => {
    try {
      set({ isCreateProductLoading: true });
      const sampleCreatedProduct = await axiosInstance.post('/api/products');
      return sampleCreatedProduct;
    } catch (error) {
      set({ isCreateProductLoading: false });
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      set({ isDeleteProductLoading: true });
      await axiosInstance.delete(`/api/products/${productId}`);
    } catch (error) {
      set({ isDeleteProductLoading: false });
      throw error;
    }
  },

  editProduct: async () => {},
});
