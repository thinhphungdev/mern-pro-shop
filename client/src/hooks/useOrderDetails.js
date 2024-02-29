import { useState, useEffect } from 'react';

import { axiosInstance } from '../axiosConfig';

export function useOrderDetails(productId) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await axiosInstance(`/api/orders/${productId}`);
        setOrderDetails(data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setError(error.response?.data);
      }
    }

    fetchOrderDetails();
  }, []);

  return { orderDetails, isLoading, error };
}
