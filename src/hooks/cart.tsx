import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { resolveProjectReferencePath } from 'typescript';

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
  console.log('🚀 ~ file: cart.tsx ~ line 30 ~ products', products);

  useEffect(() => {
    // AsyncStorage.clear();
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
      try {
        let isProductAlreadyOnCart = false;
        const mappedProducts = products.map(element => {
          if (element.id === product.id) {
            isProductAlreadyOnCart = true;
            return { ...element, quantity: element.quantity + 1 };
          }
          return element;
        });

        const newProducts = isProductAlreadyOnCart
          ? mappedProducts
          : [...products, { ...product, quantity: 1 }];

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
        setProducts(newProducts);
      } catch (error) {
        console.error(error);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
      setProducts(newProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      );
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
      setProducts(newProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return (
    <CartContext.Provider value={{ ...value }}>{children}</CartContext.Provider>
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
