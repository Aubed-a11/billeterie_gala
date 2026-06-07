import React, { createContext, useContext, useState } from 'react';
import type { PackType, OrderData } from '../models';

interface OrderContextType {
  selectedPack: PackType | null;
  setSelectedPack: (pack: PackType | null) => void;
  orderResult: any | null;
  setOrderResult: (result: any) => void;
  lastOrderData: OrderData | null;
  setLastOrderData: (data: OrderData) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPack, setSelectedPack] = useState<PackType | null>(null);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [lastOrderData, setLastOrderData] = useState<OrderData | null>(null);

  return (
    <OrderContext.Provider value={{ 
      selectedPack, 
      setSelectedPack, 
      orderResult, 
      setOrderResult,
      lastOrderData,
      setLastOrderData
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
