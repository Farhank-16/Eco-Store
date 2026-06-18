import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      _userId: null,
      
      toggleWishlist: (product) => {
        const { items, _userId } = get();
        const exists = items.some(item => item._id === product._id);
        let newItems;
        if (exists) {
          newItems = items.filter(item => item._id !== product._id);
        } else {
          newItems = [...items, product];
        }
        set({ items: newItems });
        if (_userId) {
          localStorage.setItem(`wishlist-storage-${_userId}`, JSON.stringify(newItems));
        }
      },
      
      removeFromWishlist: (productId) => {
        const { _userId } = get();
        const newItems = get().items.filter(item => item._id !== productId);
        set({ items: newItems });
        if (_userId) {
          localStorage.setItem(`wishlist-storage-${_userId}`, JSON.stringify(newItems));
        }
      },
      
      clearWishlist: () => {
        const { _userId } = get();
        set({ items: [] });
        if (_userId) {
          localStorage.setItem(`wishlist-storage-${_userId}`, JSON.stringify([]));
        }
      },

      // Load a specific user's wishlist data from localStorage
      loadUserData: (userId) => {
        const saved = localStorage.getItem(`wishlist-storage-${userId}`);
        const items = saved ? JSON.parse(saved) : [];
        set({ items, _userId: userId });
      },

      // Save current items under user key and reset the store
      saveAndClear: () => {
        const { items, _userId } = get();
        if (_userId) {
          localStorage.setItem(`wishlist-storage-${_userId}`, JSON.stringify(items));
        }
        set({ items: [], _userId: null });
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
