import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './useCartStore';
import { useWishlistStore } from './useWishlistStore';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      login: (userData) => {
        set({ user: userData });
        // Load user-specific cart & wishlist from localStorage
        const userId = userData.id || userData._id;
        useCartStore.getState().loadUserData(userId);
        useWishlistStore.getState().loadUserData(userId);
      },
      logout: () => {
        // Save current user's cart & wishlist, then clear stores
        useCartStore.getState().saveAndClear();
        useWishlistStore.getState().saveAndClear();
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
