import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product) => {
        const { items } = get();
        const existingItem = items.find(item => item._id === product._id);
        
        if (existingItem) {
          set({
            items: items.map(item => 
              item._id === product._id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }]
          });
        }
      },
      
      removeFromCart: (productId) => {
        set({
          items: get().items.filter(item => item._id !== productId)
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map(item =>
            item._id === productId ? { ...item, quantity } : item
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.discountedPrice && item.discountedPrice < item.originalPrice 
            ? item.discountedPrice 
            : item.originalPrice;
          return total + (price * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
