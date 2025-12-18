import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_info?: string;
  unit_price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product_id === newItem.product_id &&
              item.variant_id === newItem.variant_id
          );

          if (existingIndex >= 0) {
            // Update quantity if item exists
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + newItem.quantity,
            };
            return { items: updatedItems };
          }

          // Add new item
          return { items: [...state.items, newItem] };
        });
      },

      updateQuantity: (productId, variantId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            return {
              items: state.items.filter(
                (item) =>
                  !(item.product_id === productId && item.variant_id === variantId)
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.product_id === productId && item.variant_id === variantId
                ? { ...item, quantity }
                : item
            ),
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.product_id === productId && item.variant_id === variantId)
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.unit_price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'smj-cart-storage',
    }
  )
);
