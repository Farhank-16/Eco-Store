import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      _userId: null,
      
      addToCart: (product) => {
        const { items, _userId } = get();
        const existingItem = items.find(item => item._id === product._id);
        
        let newItems;
        if (existingItem) {
          newItems = items.map(item => 
            item._id === product._id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newItems = [...items, { ...product, quantity: 1 }];
        }
        set({ items: newItems });
        // Persist to user-specific key
        if (_userId) {
          localStorage.setItem(`cart-storage-${_userId}`, JSON.stringify(newItems));
        }
      },
      
      removeFromCart: (productId) => {
        const { _userId } = get();
        const newItems = get().items.filter(item => item._id !== productId);
        set({ items: newItems });
        if (_userId) {
          localStorage.setItem(`cart-storage-${_userId}`, JSON.stringify(newItems));
        }
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        const { _userId } = get();
        const newItems = get().items.map(item =>
          item._id === productId ? { ...item, quantity } : item
        );
        set({ items: newItems });
        if (_userId) {
          localStorage.setItem(`cart-storage-${_userId}`, JSON.stringify(newItems));
        }
      },
      
      clearCart: () => {
        const { _userId } = get();
        set({ items: [] });
        if (_userId) {
          localStorage.setItem(`cart-storage-${_userId}`, JSON.stringify([]));
        }
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.discountedPrice && item.discountedPrice < item.originalPrice 
            ? item.discountedPrice 
            : item.originalPrice;
          return total + (price * item.quantity);
        }, 0);
      },

      // Load a specific user's cart data from localStorage
      loadUserData: (userId) => {
        const saved = localStorage.getItem(`cart-storage-${userId}`);
        const items = saved ? JSON.parse(saved) : [];
        set({ items, _userId: userId });
      },

      // Save current items under user key and reset the store
      saveAndClear: () => {
        const { items, _userId } = get();
        if (_userId) {
          localStorage.setItem(`cart-storage-${_userId}`, JSON.stringify(items));
        }
        set({ items: [], _userId: null });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
