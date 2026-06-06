import axios from 'axios';
import type { OrderData } from '../models';

// Utilisation de la variable d'environnement, avec fallback de sécurité
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

export const createOrder = async (orderData: OrderData) => {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    throw error;
  }
};

export const uploadReceipt = async (orderId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('receipt', file);
    const response = await axios.post(`${API_URL}/orders/${orderId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'upload du reçu:", error);
    throw error;
  }
};
