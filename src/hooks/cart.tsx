import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storageResponse = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storageResponse) {
        const productsResponse: Product[] = JSON.parse(storageResponse);
        setProducts(productsResponse);
      }

      setProducts([] as Product[]);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      const newProduct: Product = { ...product, quantity: 1 };
      const newProducts = [...products, newProduct];
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
      setProducts(newProducts);
    },
    [products],
  );

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return (
    <CartContext.Provider value={{ value, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
